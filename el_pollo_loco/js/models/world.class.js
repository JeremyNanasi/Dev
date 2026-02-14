/**
 * Game world orchestrating rendering, input, collisions, and HUD.
 * @property {Character} character
 * @property {HTMLCanvasElement} canvas
 * @property {CanvasRenderingContext2D} ctx
 * @property {number} camera_x
 */
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
    throwCooldownMs = 1500;
    totalCoins = 0;
    totalSalsaBottles = 0;
    coinsCounterEl = null;
    bottlesCounterEl = null;
    gameOverImage = new Image();
    winImage = new Image();
    gameOverStartTime = null;
    winStartTime = null;

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Keyboard} keyboard
     */
    constructor(canvas, keyboard) {
        this.setupCanvas(canvas, keyboard);
        this.loadEndScreenImages();
        this.cacheHudElements();
        this.setCollectibleTotals();
        this.refreshHud();
        this.collision = new WorldCollision(this);
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

    /**
     * Starts the main world update loop.
     * @returns {void}
     */
    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
            window.EPL?.EnemySfx?.update(this);
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

    /**
     * Spawns and throws a bottle if available.
     * @param {number} now
     * @returns {void}
     */
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
        return direction === -1 ? -50 : 100;
    }

    refreshSalsaHud() {
        this.updateSalsaCounter();
        this.updateStatusBars();
    }

    checkCollisions() {
        return this.collision.checkCollisions();
    }

    /**
     * Renders the world and queues the next frame.
     * @returns {void}
     */
    draw() {
        if (document.body.classList.contains('epl-orientation-blocked')) {
            this.queueNextFrame();
            return;
        }
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
                if (enemy.isDeadState || enemy.energy <= 0) {
                    return;
                }
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
            if (typeof window.showWinOverlay === 'function') {
                window.showWinOverlay();
            }
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
}
