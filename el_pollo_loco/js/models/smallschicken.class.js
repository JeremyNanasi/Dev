/**
 * @fileoverview
 * Defines `smallchicken`, a smaller enemy variant with its own sprite set and SFX behavior.
 */
class smallchicken extends MoveableObject {
    height = 50;
    width = 60;
    y = 365;
    energy = 20;
    hitboxOffsetX = 0;
    hitboxOffsetY = -5;
    hitboxWidth = 50;
    hitboxHeight = 45;
    proximitySoundActive = false;
    IMAGES_CHICKEN_SMALL_WALKING = [
        './img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];
    IMAGES_CHICKE_SMALL_DEAD = [
        './img/3_enemies_chicken/chicken_small/2_dead/dead.png',
    ];

    /**
     * Initializes a new methods instance and sets up default runtime state.
     * The constructor prepares dependencies used by class behavior.
     * @param {unknown} param1 - Input value used by this routine.
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
     * Executes the animate routine.
     * The logic is centralized here for maintainability.
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
     * Executes the take damage routine.
     * The logic is centralized here for maintainability.
     * @param {unknown} amount - Input value used by this routine.
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

    /**
     * Executes the die routine.
     * The logic is centralized here for maintainability.
     */
    die() {
        this.energy = 0;
        this.speed = 0;
        this.currentImage = 0;
        this.playAnimation(this.deadImages);
    }

    /**
     * Starts proximity sound check.
     * The operation is isolated here to keep behavior predictable.
     */
    startProximitySoundCheck() {
        setInterval(() => this.updateProximitySound(), 1000 / 10);
    }

    /**
     * Updates proximity sound.
     * This synchronizes runtime state with current inputs.
     */
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

    /**
     * Starts loop sound.
     * The operation is isolated here to keep behavior predictable.
     */
    startLoopSound() {
        if (this.proximitySoundActive || !this.canPlayLoopSound()) return;
        this.loopSound.loop = true;
        this.loopSound.play().catch(() => {});
        this.proximitySoundActive = true;
    }

    /**
     * Stops loop sound.
     * The operation is isolated here to keep behavior predictable.
     */
    stopLoopSound() {
        if (!this.proximitySoundActive || !this.loopSound) return;
        this.loopSound.pause();
        this.proximitySoundActive = false;
    }

    /**
     * Evaluates the play loop sound condition.
     * Returns whether the current runtime state satisfies that condition.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    canPlayLoopSound() {
        if (!this.loopSound) return false;
        return this.isSoundEnabled();
    }

    /**
     * Evaluates the sound enabled condition.
     * Returns whether the current runtime state satisfies that condition.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isSoundEnabled() {
        const key = typeof SOUND_ENABLED_KEY === 'string' ? SOUND_ENABLED_KEY : 'sound-enabled';
        return localStorage.getItem(key) !== 'false';
    }

    /**
     * Returns the loop sound element.
     * This helper centralizes read access for callers.
     * @returns {unknown} Returns the value produced by this routine.
     */
    getLoopSoundElement() {
        return document.getElementById('smallchicken-loop-sound');
    }
}
