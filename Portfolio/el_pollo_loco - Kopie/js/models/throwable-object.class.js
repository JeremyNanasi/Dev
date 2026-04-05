/**
 * @fileoverview
 * Defines `ThrowableObject`, a salsa bottle entity that can be collected and thrown as a projectile.
 */
class ThrowableObject extends MoveableObject {
    IMAGE_ROTATION = [
        './img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
    ];
    IMAGE_SPLASH = [
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ];
    IMAGE_SALSA_GROUND = [
        './img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
        './img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
    ];
    groundAnimationInterval;
    gravityInterval;
    rotationInterval;
    groundY = 360;
    throwDirection = 1;
    /**
     * Initializes a new methods instance and sets up default runtime state.
     * The constructor prepares dependencies used by class behavior.
     * @param {number} x - Numeric value used by this routine.
     * @param {number} y - Numeric value used by this routine.
     * @param {object} options - Optional settings that customize this operation.
     */
    constructor(x, y, options = {}) {
        super();
        this.loadImage(this.IMAGE_ROTATION[0]);
        this.loadImages(this.IMAGE_ROTATION);
        this.loadImages(this.IMAGE_SPLASH);
        this.loadImages(this.IMAGE_SALSA_GROUND);
        this.height = 100;
        this.width = 100;
        const hasCoordinates = typeof x === 'number' && typeof y === 'number';
        const isCollectible = options.isCollectible ?? !hasCoordinates;
        this.throwDirection = options.direction ?? 1;
        if (isCollectible) {
            this.spawnCollectible(
                hasCoordinates ? x : 200 + Math.random() * 500,
                hasCoordinates ? y : 360
            );
        } else if (hasCoordinates) {
            this.throw(x, y);
        } else {
            throw new Error('ThrowableObject requires coordinates when not used as collectible.');
        }
    }

    /**
     * Executes the spawn collectible routine.
     * The logic is centralized here for maintainability.
     * @param {number} x - Numeric value used by this routine.
     * @param {number} y - Numeric value used by this routine.
     */
    spawnCollectible(x, y) {
        this.x = x;
        this.y = y;
        this.currentImage = 0;
        this.img = this.imageCache[this.IMAGE_SALSA_GROUND[0]];
        this.startGroundAnimation();
    }

    /**
     * Starts ground animation.
     * The operation is isolated here to keep behavior predictable.
     */
    startGroundAnimation() {
        this.stopGroundAnimation();
        this.groundAnimationInterval = setInterval(() => {
            this.playAnimation(this.IMAGE_SALSA_GROUND);
        }, 400);
    }

    /**
     * Stops ground animation.
     * The operation is isolated here to keep behavior predictable.
     */
    stopGroundAnimation() {
        if (this.groundAnimationInterval) {
            clearInterval(this.groundAnimationInterval);
            this.groundAnimationInterval = null;
        }
    }

    /**
     * Executes the throw routine.
     * The logic is centralized here for maintainability.
     * @param {number} x - Numeric value used by this routine.
     * @param {number} y - Numeric value used by this routine.
     */
    throw(x, y) {
        this.stopGroundAnimation();
        this.x = x;
        this.y = y;
        this.speedY = 30;
        this.currentImage = 0;
        this.img = this.imageCache[this.IMAGE_ROTATION[0]];
        this.otherDirection = this.throwDirection === -1;
        this.applyGravity();
        this.startRotation();
    }

    /**
     * Starts rotation.
     * The operation is isolated here to keep behavior predictable.
     */
    startRotation() {
        this.stopRotation();
        this.rotationInterval = setInterval(() => {
            this.playAnimation(this.IMAGE_ROTATION);
            this.x += 15 * this.throwDirection;
        }, 25);
    }

    /**
     * Stops rotation.
     * The operation is isolated here to keep behavior predictable.
     */
    stopRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
    }

    /**
     * Applies gravity.
     * The operation is isolated here to keep behavior predictable.
     */
    applyGravity() {
        this.stopGravity();
        this.gravityInterval = setInterval(() => {
            const isAboveGround = this.y < this.groundY || this.speedY > 0;
            if (isAboveGround) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            } else {
                this.y = this.groundY;
                this.speedY = 0;
                this.stopGravity();
                this.stopRotation();
                this.playSplash();
            }
        }, 1000 / 25);
    }

    /**
     * Stops gravity.
     * The operation is isolated here to keep behavior predictable.
     */
    stopGravity() {
        if (this.gravityInterval) {
            clearInterval(this.gravityInterval);
            this.gravityInterval = null;
        }
    }

    /**
     * Plays splash.
     * The operation is isolated here to keep behavior predictable.
     */
    playSplash() {
        let frameIndex = 0;
        const frameDelay = 80;
        const splashInterval = setInterval(() => {
            this.img = this.imageCache[this.IMAGE_SPLASH[frameIndex]];
            frameIndex++;
            if (frameIndex >= this.IMAGE_SPLASH.length) {
                clearInterval(splashInterval);
            }
        }, frameDelay);
    }

    /**
     * Evaluates the colliding condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {object} mo - Object argument used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isColliding(mo) {
        const thisX = this.getHitboxX();
        const thisY = this.getHitboxY();
        const thisWidth = this.getHitboxWidth();
        const thisHeight = this.getHitboxHeight();
        const moX = mo.getHitboxX?.() ?? mo.x;
        const moY = mo.getHitboxY?.() ?? mo.y;
        const moWidth = mo.getHitboxWidth?.() ?? mo.width;
        const moHeight = mo.getHitboxHeight?.() ?? mo.height;
        return thisX + thisWidth > moX
            && thisX < moX + moWidth
            && thisY + thisHeight > moY
            && thisY < moY + moHeight;
    }
}
