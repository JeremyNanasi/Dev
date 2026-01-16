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
        }, 1000 / 60);
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
        const collisionConfig = this.getCollisionConfig();
        this.level.enemies.forEach((enemy) => {
            if (this.shouldSkipEnemy(enemy)) {
                return;
            }
            if (this.isStomping(this.character, enemy, collisionConfig)) {
                this.applyStompDamage(enemy);
                this.character.speedY = collisionConfig.bounceSpeed;
                return;
            }
            if (this.isSideHit(this.character, enemy, collisionConfig)) {
                const damage = enemy.contactDamageAmount ?? collisionConfig.defaultContactDamage;
                this.character.hit(damage);
                this.statusBar.setPercentage(this.character.energy);
            }
        });
    }

    shouldSkipEnemy(enemy) {
        return enemy instanceof Endboss
            || (typeof enemy.isDead === 'function' && enemy.isDead());
    }

    applyStompDamage(enemy) {
        if (typeof enemy.die === 'function') {
            enemy.die();
            return;
        }
        if (typeof enemy.hit === 'function') {
            const damage = enemy.energy ?? 100;
            enemy.hit(damage);
            return;
        }
        enemy.energy = 0;
        enemy.isDeadState = true;
    }

    handleIconCollisions() {
        this.collectCollidingItems(this.level.icons, (index) => this.collectIcon(index), true);
    }

    handleSalsaCollisions() {
        this.collectCollidingItems(this.level.salsa, (index) => this.collectSalsa(index), true);
    }

    collectCollidingItems(items, collectFn) {
        for (let i = items.length - 1; i >= 0; i--) {
            if (this.isCharacterColliding(items[i])) {
                collectFn(i);
            }
        }
    }

    isCharacterColliding(object) {
        if (this.isCollectibleObject(object)) {
            const characterPickupBox = this.getPickupBoxForCharacter();
            const objectPickupBox = this.getPickupBoxForObject(object);
            return this.isPickupColliding(characterPickupBox, objectPickupBox);
        }
        const characterBox = this.getCollisionBox(this.character);
        const objectBox = this.getCollisionBox(object);
        return this.isCollidingBoxes(characterBox, objectBox);
    }

    isCollectibleObject(object) {
        if (object?.isCollectible === true || object?.collectible === true || object?.type === 'collectible') {
            return true;
        }
        if (object instanceof Icons) {
            return true;
        }
        return object instanceof ThrowableObject && this.level?.salsa?.includes(object);
    }

    getPickupBoxForCharacter() {
        const x = this.character.x + 55;
        const y = this.character.y + 160;
        const width = 70;
        const height = 40;
        return {
            x,
            y,
            width,
            height,
            left: x,
            right: x + width,
            top: y,
            bottom: y + height
        };
    }

    getPickupBoxForObject(object) {
        const inset = 8;
        const x = object.x + inset;
        const y = object.y + inset;
        const width = Math.max(10, (object.width || 50) - inset * 2);
        const height = Math.max(10, (object.height || 50) - inset * 2);
        return {
            x,
            y,
            width,
            height,
            left: x,
            right: x + width,
            top: y,
            bottom: y + height
        };
    }

    isPickupColliding(characterPickupBox, objectPickupBox) {
        if (!this.isCollidingBoxes(characterPickupBox, objectPickupBox)) {
            return false;
        }
        const overlap = this.getOverlap(characterPickupBox, objectPickupBox);
        return overlap.x >= 10 && overlap.y >= 10;
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
            this.drawEndScreen(this.winImage, 'winStartTime');
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
        if (!total || total <= 0 || collected <= 0) {
            return 0;
        }
        const ratio = collected / total;
        const segmentIndex = Math.ceil(ratio * 5);
        const percentage = segmentIndex * 20;
        return Math.min(100, percentage);
    }

    getCollisionConfig() {
        return {
            stompVerticalTolerance: 30,
            stompMinOverlapX: 15,
            stompMinOverlapXRatio: 0.25,
            stompCenterMargin: 10,
            minOverlapX: 5,
            minOverlapY: 10,
            topGrace: 15,
            bounceSpeed: 15,
            defaultContactDamage: 5
        };
    }

    getCollisionBox(object, offset = {}) {
        const baseX = object.getHitboxX?.() ?? object.x ?? 0;
        const baseY = object.getHitboxY?.() ?? object.y ?? 0;
        const baseWidth = object.getHitboxWidth?.() ?? object.width ?? 0;
        const baseHeight = object.getHitboxHeight?.() ?? object.height ?? 0;
        const x = baseX + (offset.x ?? 0);
        const y = baseY + (offset.y ?? 0);
        const width = baseWidth + (offset.width ?? 0);
        const height = baseHeight + (offset.height ?? 0);

        return {
            x,
            y,
            width,
            height,
            left: x,
            right: x + width,
            top: y,
            bottom: y + height
        };
    }

    isCollidingBoxes(aBox, bBox) {
        return aBox.right > bBox.left
            && aBox.left < bBox.right
            && aBox.bottom > bBox.top
            && aBox.top < bBox.bottom;
    }

    getOverlap(aBox, bBox) {
        const overlapX = Math.min(aBox.right, bBox.right) - Math.max(aBox.left, bBox.left);
        const overlapY = Math.min(aBox.bottom, bBox.bottom) - Math.max(aBox.top, bBox.top);
        return {
            x: Math.max(0, overlapX),
            y: Math.max(0, overlapY)
        };
    }

    isStomping(character, enemy, config) {
        const characterBox = this.getCollisionBox(character);
        const enemyBox = this.getCollisionBox(enemy);

        if (!this.isCollidingBoxes(characterBox, enemyBox)) {
            return false;
        }

        const isFalling = character.speedY < 0;
        if (!isFalling) {
            return false;
        }

        const characterBottom = characterBox.bottom;
        const enemyTop = enemyBox.top;
        const verticalPenetration = characterBottom - enemyTop;

        if (verticalPenetration > config.stompVerticalTolerance) {
            return false;
        }

        const overlap = this.getOverlap(characterBox, enemyBox);
        const minOverlapNeeded = Math.min(
            config.stompMinOverlapX,
            enemyBox.width * config.stompMinOverlapXRatio
        );
        if (overlap.x < minOverlapNeeded) {
            return false;
        }

        const characterCenterX = characterBox.left + characterBox.width / 2;
        const withinEnemyBounds = characterCenterX >= enemyBox.left - config.stompCenterMargin
            && characterCenterX <= enemyBox.right + config.stompCenterMargin;

        return withinEnemyBounds;
    }

    isSideHit(character, enemy, config) {
        const characterBox = this.getCollisionBox(character);
        const enemyBox = this.getCollisionBox(enemy);

        if (!this.isCollidingBoxes(characterBox, enemyBox)) {
            return false;
        }

        if (this.isStomping(character, enemy, config)) {
            return false;
        }

        const overlap = this.getOverlap(characterBox, enemyBox);
        if (overlap.x < config.minOverlapX || overlap.y < config.minOverlapY) {
            return false;
        }

        const characterBottom = characterBox.bottom;
        const enemyTop = enemyBox.top;
        const isFalling = character.speedY < 0;

        if (isFalling && characterBottom <= enemyTop + config.topGrace) {
            return false;
        }

        return true;
    }
}
