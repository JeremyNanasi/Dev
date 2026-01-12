class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    iconsStatusBar = new StatusBar('icons');
    bottlesStatusBar = new StatusBar('bottles');
    throwableObject = [];
    collectedSalsa = 0;
    lastThrowTime = 0;
    throwCooldownMs = 500;
    totalCoins = 0;
    totalSalsaBottles = 0;
    coinsCounterEl = null;
    bottlesCounterEl = null;
    gameOverImage = new Image();
    winImage = new Image();
    gameOverStartTime = null;
    winStartTime = null;

    constructor(canvas, keyboard) {
        this.setupCanvas(canvas, keyboard);
        this.loadEndScreenImages();
        this.cacheHudElements();
        this.setCollectibleTotals();
        this.refreshHud();
        this.initializeWorld();
    }

    setupCanvas(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
    }

    loadEndScreenImages() {
        this.gameOverImage.src = './img/9_intro_outro_screens/game_over/game over.png';
        this.winImage.src = './img/You won, you lost/You Win A.png';
    }

    setCollectibleTotals() {
        this.totalCoins = this.level.icons?.length || 0;
        this.totalSalsaBottles = this.level.salsa?.length || 0;
    }

    refreshHud() {
        this.updateCoinCounter();
        this.updateSalsaCounter();
        this.updateStatusBars();
    }

    initializeWorld() {
        this.draw();
        this.setWorld();
        this.checkCollisions();
        this.run();
        this.draw();
    }

    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach((enemy) => {
            enemy.world = this;
        });
    }

    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
        }, 200);
    }

    checkThrowObjects() {
        const now = Date.now();
        if (!this.canThrowBottle(now)) {
            return;
        }
        this.throwBottle(now);
    }

    canThrowBottle(now) {
        return this.keyboard.D
            && this.collectedSalsa > 0
            && now - this.lastThrowTime >= this.throwCooldownMs;
    }

    throwBottle(now) {
        const bottle = this.createBottle();
        this.throwableObject.push(bottle);
        this.collectedSalsa -= 1;
        this.lastThrowTime = now;
        this.refreshSalsaHud();
    }

    createBottle() {
        const direction = this.getThrowDirection();
        const offsetX = this.getThrowOffsetX(direction);
        return new ThrowableObject(
            this.character.x + offsetX,
            this.character.y + 100,
            { isCollectible: false, direction }
        );
    }

    getThrowDirection() {
        return this.character.otherDirection ? -1 : 1;
    }

    getThrowOffsetX(direction) {
        return direction === -1 ? -20 : 100;
    }

    refreshSalsaHud() {
        this.updateSalsaCounter();
        this.updateStatusBars();
    }

    checkCollisions() {
        this.handleEnemyCollisions();
        this.handleIconCollisions();
        this.handleSalsaCollisions();
        this.handleThrowableCollisions();
    }

    handleEnemyCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (this.shouldSkipEnemy(enemy)) {
                return;
            }
            const rects = this.getCollisionRects(enemy);
            if (this.isRectOverlapping(rects.characterRect, rects.enemyRect)) {
                this.resolveEnemyCollision(enemy, rects);
            }
        });
    }

    shouldSkipEnemy(enemy) {
        return enemy instanceof Endboss
            || (typeof enemy.isDead === 'function' && enemy.isDead());
    }

    getCollisionRects(enemy) {
        return {
            characterRect: this.getHitboxRect(this.character),
            enemyRect: this.getHitboxRect(enemy)
        };
    }

    resolveEnemyCollision(enemy, rects) {
        if (this.isJumpAttack(rects)) {
            if (typeof enemy.die === 'function') {
                enemy.die();
            }
            this.character.speedY = 20;
            return;
        }
        
        this.character.hit();
        this.statusBar.setPercentage(this.character.energy);
    }

    isJumpAttack(rects) {
        const characterRect = rects.characterRect;
        const enemyRect = rects.enemyRect;
        
        const isFalling = this.character.speedY < 0;
        const isInAir = this.character.isAboveGround();
        
        const characterBottom = characterRect.y + characterRect.height;
        const enemyTop = enemyRect.y;
        const enemyMiddle = enemyRect.y + (enemyRect.height * 0.5);
        
        const isComingFromAbove = characterBottom <= enemyMiddle;
        
        const verticalOverlap = characterBottom - enemyTop;
        const isSmallOverlap = verticalOverlap > 0 && verticalOverlap < (enemyRect.height * 0.6);
        
        return isFalling && isInAir && isComingFromAbove && isSmallOverlap;
    }

    handleIconCollisions() {
        this.collectCollidingItems(this.level.icons, (index) => this.collectIcon(index));
    }

    handleSalsaCollisions() {
        this.collectCollidingItems(this.level.salsa, (index) => this.collectSalsa(index));
    }

    collectCollidingItems(items, collectFn) {
        for (let i = items.length - 1; i >= 0; i--) {
            if (this.isCharacterColliding(items[i])) {
                collectFn(i);
            }
        }
    }

    isCharacterColliding(object) {
        const characterRect = this.getHitboxRect(this.character);
        const objectRect = this.getHitboxRect(object);
        return this.isRectOverlapping(characterRect, objectRect);
    }

    handleThrowableCollisions() {
        for (let i = this.throwableObject.length - 1; i >= 0; i--) {
            if (this.isBottleHittingEnemy(this.throwableObject[i])) {
                this.throwableObject.splice(i, 1);
            }
        }
    }

    isBottleHittingEnemy(bottle) {
        for (let j = 0; j < this.level.enemies.length; j++) {
            const enemy = this.level.enemies[j];
            if (bottle.isColliding(enemy)) {
                this.applyBottleHit(enemy);
                return true;
            }
        }
        return false;
    }

    applyBottleHit(enemy) {
        enemy.hit(10);
        if (enemy instanceof Endboss) {
            this.updateBossAfterHit(enemy);
        }
    }

    updateBossAfterHit(enemy) {
        enemy.updateHealthBar?.();
        if (enemy.energy <= 0 && typeof enemy.playDeathAnimation === 'function') {
            enemy.playDeathAnimation();
            return;
        }
        enemy.playHurtAnimation?.();
    }

    collectIcon(index) {
        this.level.icons.splice(index, 1);
        this.updateCoinCounter();
        this.updateStatusBars();
    }

    collectSalsa(index) {
        const [bottle] = this.level.salsa.splice(index, 1);
        if (bottle && typeof bottle.stopGroundAnimation === 'function') {
            bottle.stopGroundAnimation();
        }
        this.collectedSalsa += 1;
        this.refreshSalsaHud();
    }

    draw() {
        this.clearCanvas();
        this.startCamera();
        this.drawBackgroundLayers();
        this.resetCamera();
        this.drawHud();
        this.startCamera();
        this.drawGameplayObjects();
        this.resetCamera();
        this.drawEndScreens();
        this.queueNextFrame();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    startCamera() {
        this.ctx.translate(this.camera_x, 0);
    }

    resetCamera() {
        this.ctx.translate(-this.camera_x, 0);
    }

    drawBackgroundLayers() {
        const { airLayer, otherLayers } = this.getBackgroundLayers();
        this.addobjectsToMap(airLayer);
        this.addobjectsToMap(this.level.clouds);
        this.addobjectsToMap(otherLayers);
    }

    getBackgroundLayers() {
        const backgroundObjects = this.level.backgroundObjects || [];
        const airLayer = backgroundObjects.filter((obj) => this.isAirLayer(obj));
        const otherLayers = backgroundObjects.filter((obj) => !airLayer.includes(obj));
        return { airLayer, otherLayers };
    }

    isAirLayer(obj) {
        const src = this.getBackgroundSource(obj);
        return src?.includes('/5_background/layers/air.png');
    }

    getBackgroundSource(obj) {
        return typeof obj.img?.src === 'string' ? obj.img.src : obj.imagePath;
    }

    drawHud() {
        this.addToMap(this.statusBar);
        this.addToMap(this.iconsStatusBar);
        this.addToMap(this.bottlesStatusBar);
    }

    drawGameplayObjects() {
        this.drawBossHealthBars();
        this.addToMap(this.character);
        this.addobjectsToMap(this.level.enemies);
        this.addobjectsToMap(this.level.icons);
        this.addobjectsToMap(this.level.salsa);
        this.addobjectsToMap(this.throwableObject);
    }

    drawBossHealthBars() {
        this.level.enemies.forEach((enemy) => {
            if (enemy instanceof Endboss && enemy.healthBar) {
                enemy.updateHealthBar?.();
                this.addToMap(enemy.healthBar);
            }
        });
    }

    drawEndScreens() {
        if (this.character?.isDead?.() && this.gameOverImage.complete) {
            this.drawEndScreen(this.gameOverImage, 'gameOverStartTime');
            return;
        }
        if (this.isBossDefeated() && this.winImage.complete) {
            this.drawEndScreen(this.winImage, 'winStartTime', { baseScale: 0.92, pulseAmplitude: 0.02 });
        }
    }

    queueNextFrame() {
        const animationFrame = window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || ((callback) => setTimeout(callback, 1000 / 60));

        animationFrame(() => this.draw());
    }

    isBossDefeated() {
        const boss = this.level.enemies?.find((enemy) => enemy instanceof Endboss);
        return Boolean(boss && (boss.isDeadState || boss.energy <= 0));
    }

    drawEndScreen(image, timerKey, options = {}) {
        const { baseScale = 1.05, pulseAmplitude = 0.03 } = options;
        if (!this[timerKey]) {
            this[timerKey] = Date.now();
        }
        const elapsed = (Date.now() - this[timerKey]) / 1000;
        const pulse = Math.sin(elapsed * Math.PI) * pulseAmplitude;
        const scale = baseScale + pulse;
        const drawWidth = this.canvas.width * scale;
        const drawHeight = this.canvas.height * scale;
        const drawX = (this.canvas.width - drawWidth) / 2;
        const drawY = (this.canvas.height - drawHeight) / 2;
        this.ctx.fillStyle = '#000';
        this.ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    }

    addobjectsToMap(objects) {
        if (!objects) {
            return;
        }
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        }
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);

        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    flipImageBack(mo) {
        mo.x = mo.x * -1;
        this.ctx.restore();
    }

    cacheHudElements() {
        this.coinsCounterEl = document.getElementById('coins-counter');
        this.bottlesCounterEl = document.getElementById('bottles-counter');
    }

    updateCoinCounter() {
        if (!this.coinsCounterEl) {
            return;
        }

        const collected = this.totalCoins - (this.level.icons?.length || 0);
        this.coinsCounterEl.textContent = `${collected}/${this.totalCoins}`;
    }

    updateSalsaCounter() {
        if (!this.bottlesCounterEl) {
            return;
        }

        this.bottlesCounterEl.textContent = `${this.collectedSalsa}/${this.totalSalsaBottles}`;
    }

    updateStatusBars() {
        if (this.iconsStatusBar) {
            const collectedCoins = this.totalCoins - (this.level.icons?.length || 0);
            this.iconsStatusBar.setPercentage(this.getSegmentedPercentage(collectedCoins, this.totalCoins));
        }

        if (this.bottlesStatusBar) {
            this.bottlesStatusBar.setPercentage(
                this.getSegmentedPercentage(this.collectedSalsa, this.totalSalsaBottles)
            );
        }
    }

    getSegmentedPercentage(collected, total) {
        if (!total || total <= 0) {
            return 0;
        }

        const segmentSize = total / 5;
        const segmentIndex = Math.ceil(collected / segmentSize);
        const percentage = segmentIndex * 20;

        return Math.max(0, Math.min(100, percentage));
    }

    getHitboxRect(object) {
        return {
            x: object.getHitboxX?.() ?? object.x ?? 0,
            y: object.getHitboxY?.() ?? object.y ?? 0,
            width: object.getHitboxWidth?.() ?? object.width ?? 0,
            height: object.getHitboxHeight?.() ?? object.height ?? 0
        };
    }

    isRectOverlapping(a, b) {
        return a.x + a.width > b.x
            && a.x < b.x + b.width
            && a.y + a.height > b.y
            && a.y < b.y + b.height;
    }
}