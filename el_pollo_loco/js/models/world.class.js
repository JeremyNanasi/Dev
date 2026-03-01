/** Defines `World`, the main game orchestrator coordinating rendering, input, collisions, HUD updates, and camera movement. Game world orchestrating rendering, input, collisions, and HUD. */
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
    endAudioStopped = false;
    /** Initializes a new methods instance and sets up default runtime state. The constructor prepares dependencies used by class behavior. */
    constructor(canvas, keyboard) {
        this.setupCanvas(canvas, keyboard);
        this.loadEndScreenImages();
        this.cacheHudElements();
        this.setCollectibleTotals();
        this.refreshHud();
        this.collision = new WorldCollision(this);
        this.initializeWorld();
    }

    /** Initializes canvas. It is part of the module startup flow. */
    setupCanvas(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
    }

    /** Loads end screen images. The operation is isolated here to keep behavior predictable. */
    loadEndScreenImages() {
        this.gameOverImage.src = './img/9_intro_outro_screens/game_over/game over.png';
        this.winImage.src = './img/You won, you lost/You Win A.png';
    }

    /** Sets the collectible totals. This keeps persistent and in-memory state aligned. */
    setCollectibleTotals() {
        this.totalCoins = this.level.icons?.length || 0;
        this.totalSalsaBottles = this.level.salsa?.length || 0;
    }

    /** Refreshes hud. The operation is isolated here to keep behavior predictable. */
    refreshHud() {
        this.updateCoinCounter();
        this.updateSalsaCounter();
        this.updateStatusBars();
    }

    /** Initializes world. It is part of the module startup flow. */
    initializeWorld() {
        this.draw();
        this.setWorld();
        this.checkCollisions();
        this.run();
        this.draw();
    }

    /** Sets the world. This keeps persistent and in-memory state aligned. */
    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach((enemy) => {
            enemy.world = this;
        });
    }

    /** Executes the run routine. The logic is centralized here for maintainability. */
    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
            window.EPL?.EnemySfx?.update(this);
        }, 1000 / 60);
    }

    /** Executes the check throw objects routine. The logic is centralized here for maintainability. */
    checkThrowObjects() {
        const now = Date.now();
        if (!this.canThrowBottle(now)) {
            return;
        }
        this.throwBottle(now);
    }

    /** Evaluates the throw bottle condition. Returns whether the current runtime state satisfies that condition. */
    canThrowBottle(now) {
        return this.keyboard.D
            && this.collectedSalsa > 0
            && now - this.lastThrowTime >= this.throwCooldownMs;
    }

    /** Executes the throw bottle routine. The logic is centralized here for maintainability. */
    throwBottle(now) {
        const bottle = this.createBottle();
        this.throwableObject.push(bottle);
        this.collectedSalsa -= 1;
        this.character.registerMovement(now);
        this.lastThrowTime = now;
        this.refreshSalsaHud();
    }

    /** Creates bottle. The result is consumed by downstream game logic. */
    createBottle() {
        const direction = this.getThrowDirection();
        const offsetX = this.getThrowOffsetX(direction);
        return new ThrowableObject(
            this.character.x + offsetX,
            this.character.y + 100,
            { isCollectible: false, direction }
        );
    }

    /** Returns the throw direction. This helper centralizes read access for callers. */
    getThrowDirection() {
        return this.character.otherDirection ? -1 : 1;
    }

    /** Returns the throw offset x. This helper centralizes read access for callers. */
    getThrowOffsetX(direction) {
        return direction === -1 ? -50 : 100;
    }

    /** Refreshes salsa hud. The operation is isolated here to keep behavior predictable. */
    refreshSalsaHud() {
        this.updateSalsaCounter();
        this.updateStatusBars();
    }

    /** Executes the check collisions routine. The logic is centralized here for maintainability. */
    checkCollisions() {
        return this.collision.checkCollisions();
    }

    /** Draws routine. The operation is isolated here to keep behavior predictable. */
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

    /** Executes the clear canvas routine. The logic is centralized here for maintainability. */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /** Starts camera. The operation is isolated here to keep behavior predictable. */
    startCamera() {
        this.ctx.translate(this.camera_x, 0);
    }

    /** Resets camera. The operation is isolated here to keep behavior predictable. */
    resetCamera() {
        this.ctx.translate(-this.camera_x, 0);
    }

    /** Draws background layers. The operation is isolated here to keep behavior predictable. */
    drawBackgroundLayers() {
        const { airLayer, otherLayers } = this.getBackgroundLayers();
        this.addobjectsToMap(airLayer);
        this.addobjectsToMap(this.level.clouds);
        this.addobjectsToMap(otherLayers);
    }

    /** Returns the background layers. This helper centralizes read access for callers. */
    getBackgroundLayers() {
        const backgroundObjects = this.level.backgroundObjects || [];
        const airLayer = backgroundObjects.filter((obj) => this.isAirLayer(obj));
        const otherLayers = backgroundObjects.filter((obj) => !airLayer.includes(obj));
        return { airLayer, otherLayers };
    }

    /** Evaluates the air layer condition. Returns whether the current runtime state satisfies that condition. */
    isAirLayer(obj) {
        const src = this.getBackgroundSource(obj);
        return src?.includes('/5_background/layers/air.png');
    }

    /** Returns the background source. This helper centralizes read access for callers. */
    getBackgroundSource(obj) {
        return typeof obj.img?.src === 'string' ? obj.img.src : obj.imagePath;
    }

    /** Draws hud. The operation is isolated here to keep behavior predictable. */
    drawHud() {
        this.addToMap(this.statusBar);
        this.addToMap(this.iconsStatusBar);
        this.addToMap(this.bottlesStatusBar);
    }

    /** Draws gameplay objects. The operation is isolated here to keep behavior predictable. */
    drawGameplayObjects() {
        this.drawBossHealthBars();
        this.addToMap(this.character);
        this.addobjectsToMap(this.level.enemies);
        this.addobjectsToMap(this.level.icons);
        this.addobjectsToMap(this.level.salsa);
        this.addobjectsToMap(this.throwableObject);
    }

    /** Draws boss health bars. The operation is isolated here to keep behavior predictable. */
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

    /** Draws end screens. The operation is isolated here to keep behavior predictable. */
    drawEndScreens() {
        if (this.character?.isDead?.()) {
            this.stopEndAudioOnce();
            if (!this.gameOverImage.complete) return;
            this.drawEndScreen(this.gameOverImage, 'gameOverStartTime');
            return;
        }
        if (!this.isBossDefeated()) return;
        this.stopEndAudioOnce();
        if (!this.winImage.complete) return;
        this.drawEndScreen(this.winImage, 'winStartTime', { baseScale: 0.92, pulseAmplitude: 0.02 });
        if (typeof window.showWinOverlay === 'function') window.showWinOverlay();
    }

    /** Queues next frame. The operation is isolated here to keep behavior predictable. */
    queueNextFrame() {
        const animationFrame = window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || ((callback) => setTimeout(callback, 1000 / 60));
        animationFrame(() => this.draw());
    }

    /** Evaluates the boss defeated condition. Returns whether the current runtime state satisfies that condition. */
    isBossDefeated() {
        const boss = this.level.enemies?.find((enemy) => enemy instanceof Endboss);
        return Boolean(boss && (boss.isDeadState || boss.energy <= 0));
    }

    /** Stops end audio once. The operation is isolated here to keep behavior predictable. */
    stopEndAudioOnce() {
        if (this.endAudioStopped) return;
        window.EPL?.Sound?.muteForEndState?.();
        this.endAudioStopped = true;
    }

    /** Draws end screen. The operation is isolated here to keep behavior predictable. */
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

    /** Executes the addobjects to map routine. The logic is centralized here for maintainability. */
    addobjectsToMap(objects) {
        if (!objects) {
            return;
        }
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    /** Executes the add to map routine. The logic is centralized here for maintainability. */
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

    /** Executes the flip image routine. The logic is centralized here for maintainability. */
    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    /** Executes the flip image back routine. The logic is centralized here for maintainability. */
    flipImageBack(mo) {
        mo.x = mo.x * -1;
        this.ctx.restore();
    }

    /** Executes the cache hud elements routine. The logic is centralized here for maintainability. */
    cacheHudElements() {
        this.coinsCounterEl = document.getElementById('coins-counter');
        this.bottlesCounterEl = document.getElementById('bottles-counter');
    }

    /** Updates coin counter. This synchronizes runtime state with current inputs. */
    updateCoinCounter() {
        if (!this.coinsCounterEl) {
            return;
        }
        const collected = this.totalCoins - (this.level.icons?.length || 0);
        this.coinsCounterEl.textContent = `${collected}/${this.totalCoins}`;
    }

    /** Updates salsa counter. This synchronizes runtime state with current inputs. */
    updateSalsaCounter() {
        if (!this.bottlesCounterEl) {
            return;
        }
        this.bottlesCounterEl.textContent = `${this.collectedSalsa}/${this.totalSalsaBottles}`;
    }

    /** Updates status bars. This synchronizes runtime state with current inputs. */
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

    /** Returns the segmented percentage. This helper centralizes read access for callers. */
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
