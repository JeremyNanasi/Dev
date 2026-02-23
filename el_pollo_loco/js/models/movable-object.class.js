/**
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
     * Starts gravity updates for this object.
     * @returns {void}
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
    /** Checks `isAboveGround`. @returns {*} Result. */
    isAboveGround() {
        if (this instanceof ThrowableObject) return true;
        return this.y < 190;
    }


    /**
     * Checks AABB collision against another object.
     * @param {Object} mo
     * @returns {boolean}
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
    /** Gets `getHitboxX` data. @returns {*} Result. */
    getHitboxX() {
        return this.x + (this.hitboxOffsetX ?? 0);
    }
    /** Gets `getHitboxY` data. @returns {*} Result. */
    getHitboxY() {
        return this.y + (this.hitboxOffsetY ?? 0);
    }
    /** Gets `getHitboxWidth` data. @returns {*} Result. */
    getHitboxWidth() {
        return this.hitboxWidth ?? this.width;
    }
    /** Gets `getHitboxHeight` data. @returns {*} Result. */
    getHitboxHeight() {
        return this.hitboxHeight ?? this.height;
    }


    /**
     * Reduces energy and records the last hit time.
     * @param {number} amount
     * @returns {void}
     */
    takeDamage(amount = 5) {
        this.energy -= amount;
        if (this.energy < 0) this.energy = 0;
        else this.lastHit = Date.now();
    }

    /** Checks `isHurt`. @returns {*} Result. */
    isHurt() {
        return (Date.now() - this.lastHit) / 1000 < 1;
    }

    /** Checks `isDead`. @returns {*} Result. */
    isDead() {
        return this.energy == 0;
    }

    /** Runs `playAnimation`. @param {*} images - Value. */
    playAnimation(images) {
        let i = this.currentImage % images.length;
        this.img = this.imageCache[images[i]];
        this.currentImage++;
    }
    /** Runs `playAnimationDead`. @param {*} images - Value. */
    playAnimationDead(images) {
        if (!this.currentImage) this.currentImage = 0;
        if (this.currentImage < images.length) {
            this.img = this.imageCache[images[this.currentImage]];
            this.currentImage++;
        } else {
            this.img = this.imageCache[images[images.length - 1]];
        }
    }
    /** Runs `moveRight`. */
    moveRight() { 
        this.x += this.speed;
    } 
    /** Runs `moveLeft`. */
    moveLeft() { 
        this.x -= this.speed; 
    }
}
