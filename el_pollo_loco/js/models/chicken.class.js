/**
 * Standard chicken enemy with movement, damage, and proximity audio.
 * @extends MoveableObject
 */
class Chicken extends MoveableObject {
    height = 60;
    width = 70;
    y = 355;
    energy = 20;
    hitboxOffsetX = 5;
    hitboxOffsetY = 5;
    hitboxWidth = 60;
    hitboxHeight = 50;
    proximitySoundActive = false;

    IMAGES_WALKING = [
        './img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];

    IMAGES_CHICKE_NORMAL_DEAD = [
        './img/3_enemies_chicken/chicken_normal/2_dead/dead.png'
    ];

    /**
     * @param {{isSmall?: boolean}} [options]
     */
    constructor({ isSmall = false } = {}) {
        super().loadImage(isSmall ? this.IMAGES_CHICKEN_SMALL_WALKING[0] : this.IMAGES_WALKING[0]);
        this.isSmall = isSmall;
        this.walkingImages = isSmall ? this.IMAGES_CHICKEN_SMALL_WALKING : this.IMAGES_WALKING;
        this.deadImages = isSmall ? this.IMAGES_CHICKE_SMALL_DEAD : this.IMAGES_CHICKE_NORMAL_DEAD;

        this.loadImages(this.walkingImages);
        this.loadImages(this.deadImages);

        this.x = 500 + Math.random() * 1500;
        this.speed = 0.15 + Math.random() * 0.5;
        this.loopSound = this.getLoopSoundElement();

        this.animate();
        this.startProximitySoundCheck();
    }

    /**
     * Starts movement and sprite frame loops.
     * @returns {void}
     */
    animate() {
        setInterval(() => {
            if (this.isDead()) {
                return;
            }
            this.moveLeft();
        }, 1000 / 60);

        setInterval(() => {
            if (this.isDead()) {
                this.playAnimation(this.deadImages);
                return;
            }
            this.playAnimation(this.walkingImages);
        }, 200);
    }

    /**
     * Applies damage and switches to dead state when depleted.
     * @param {number} [amount=5]
     * @returns {void}
     */
    takeDamage(amount = 5) {
        if (this.isDead()) {
            return;
        }
        super.takeDamage(amount);
        if (this.energy <= 0) {
            this.die();
        }
    }
    /** Runs `die`. */
    die() {
        this.energy = 0;
        this.speed = 0;
        this.currentImage = 0;
        this.playAnimation(this.deadImages);
    }
    /** Runs `startProximitySoundCheck`. */
    startProximitySoundCheck() {
        setInterval(() => this.updateProximitySound(), 1000 / 10);
    }
    /** Updates `updateProximitySound` state. @returns {*} Result. */
    updateProximitySound() {
        if (this.isDead()) {
            this.stopLoopSound();
            return;
        }
        const character = this.world?.character;
        if (!character) return;
        if (!this.isSoundEnabled()) {
            this.stopLoopSound();
            return;
        }
        const inRange = Math.abs(character.x - this.x) <= 200;
        if (inRange) this.startLoopSound();
        else this.stopLoopSound();
    }
    /** Runs `startLoopSound`. @returns {*} Result. */
    startLoopSound() {
        if (this.proximitySoundActive || !this.canPlayLoopSound()) return;
        this.loopSound.loop = true;
        this.loopSound.play().catch(() => {});
        this.proximitySoundActive = true;
    }
    /** Runs `stopLoopSound`. @returns {*} Result. */
    stopLoopSound() {
        if (!this.proximitySoundActive || !this.loopSound) return;
        this.loopSound.pause();
        this.proximitySoundActive = false;
    }
    /** Checks `canPlayLoopSound`. @returns {*} Result. */
    canPlayLoopSound() {
        if (!this.loopSound) return false;
        return this.isSoundEnabled();
    }
    /** Checks `isSoundEnabled`. @returns {*} Result. */
    isSoundEnabled() {
        const key = typeof SOUND_ENABLED_KEY === 'string' ? SOUND_ENABLED_KEY : 'sound-enabled';
        return localStorage.getItem(key) !== 'false';
    }
    /** Gets `getLoopSoundElement` data. @returns {*} Result. */
    getLoopSoundElement() {
        const id = this.isSmall ? 'smallchicken-loop-sound' : 'chicken-loop-sound';
        return document.getElementById(id);
    }
}
