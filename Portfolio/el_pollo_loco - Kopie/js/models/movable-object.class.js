/**
 * @fileoverview
 * Orientation controller that applies orientation blocking rules, manages related UI state, and wraps timed callbacks safely.
 *
 * Exposed under `window.EPL.Controllers.Orientation`.
 *
 * Base movable entity with physics, hitbox helpers, and animation playback.
 * @extends DrawableObject
 * @property {number} speed
 * @property {number} speedY
 * @property {number} acceleration
 * @property {number} energy
 * @property {number} lastHit
 */
class MoveableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 600;
    lastHit = 0;
    currentImage = 0;
    frameTimers = {
        walking: 111.1,
        jumping: 250,
        hurt: 150,
        dead: 200
    };

    lastFrameTime = {
        walking: 0,
        jumping: 0,
        hurt: 0,
        dead: 0
    };

    /**
     * Applies gravity.
     * The operation is isolated here to keep behavior predictable.
     */
    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
                if (this.y < 0) this.y = 0;
                if (!this.isAboveGround() && this.speedY < 0) {
                    this.speedY = 0;
                    if (this.y > 190 && !(this instanceof ThrowableObject)) {
                        this.y = 190;
                    }
                }
            }
        }, 1000 / 25);
    }

    /**
     * Evaluates the above ground condition.
     * Returns whether the current runtime state satisfies that condition.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isAboveGround() {
        if (this instanceof ThrowableObject) return true;
        return this.y < 190;
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
        return thisX < moX + moWidth &&
            thisX + thisWidth > moX &&
            thisY < moY + moHeight &&
            thisY + thisHeight > moY;
    }

    /**
     * Returns the hitbox x.
     * This helper centralizes read access for callers.
     * @returns {number} Returns the computed numeric value.
     */
    getHitboxX() {
        return this.x + (this.hitboxOffsetX ?? 0);
    }

    /**
     * Returns the hitbox y.
     * This helper centralizes read access for callers.
     * @returns {number} Returns the computed numeric value.
     */
    getHitboxY() {
        return this.y + (this.hitboxOffsetY ?? 0);
    }

    /**
     * Returns the hitbox width.
     * This helper centralizes read access for callers.
     * @returns {number} Returns the computed numeric value.
     */
    getHitboxWidth() {
        return this.hitboxWidth ?? this.width;
    }

    /**
     * Returns the hitbox height.
     * This helper centralizes read access for callers.
     * @returns {number} Returns the computed numeric value.
     */
    getHitboxHeight() {
        return this.hitboxHeight ?? this.height;
    }

    /**
     * Executes the take damage routine.
     * The logic is centralized here for maintainability.
     * @param {unknown} amount - Input value used by this routine.
     */
    takeDamage(amount = 5) {
        this.energy -= amount;
        if (this.energy < 0) this.energy = 0;
        else this.lastHit = Date.now();
    }

    /**
     * Evaluates the hurt condition.
     * Returns whether the current runtime state satisfies that condition.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isHurt() {
        return (Date.now() - this.lastHit) / 1000 < 1;
    }

    /**
     * Evaluates the dead condition.
     * Returns whether the current runtime state satisfies that condition.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isDead() {
        return this.energy == 0;
    }

    /**
     * Plays animation.
     * The operation is isolated here to keep behavior predictable.
     * @param {number} images - Numeric value used by this routine.
     */
    playAnimation(images) {
        let i = this.currentImage % images.length;
        this.img = this.imageCache[images[i]];
        this.currentImage++;
    }

    /**
     * Plays animation dead.
     * The operation is isolated here to keep behavior predictable.
     * @param {object} images - Object argument used by this routine.
     */
    playAnimationDead(images) {
        if (!this.currentImage) this.currentImage = 0;
        if (this.currentImage < images.length) {
            this.img = this.imageCache[images[this.currentImage]];
            this.currentImage++;
        } else {
            this.img = this.imageCache[images[images.length - 1]];
        }
    }

    /**
     * Executes the move right routine.
     * The logic is centralized here for maintainability.
     */
    moveRight() {
        this.x += this.speed;
    }
    
    /**
     * Executes the move left routine.
     * The logic is centralized here for maintainability.
     */
    moveLeft() {
        this.x -= this.speed;
    }
}
