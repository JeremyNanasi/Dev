/**
 * @fileoverview
 * Defines `Chicken`, a basic enemy that patrols left, plays walk/death animations,
 * and optionally plays a looping proximity sound when the player is nearby.
 *
 * The constructor supports a small variant via the `isSmall` option, which switches
 * sprite sets and the loop-sound element ID.
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
     * Creates a chicken enemy instance and initializes sprites, position, and sound behavior.
     *
     * The `isSmall` option switches to the small-chicken sprite set and uses a different
     * loop-sound element ID.
     *
     * @param {Object} [options={}] - Construction options.
     * @param {boolean} [options.isSmall=false] - Whether to use the small-chicken variant assets and sound.
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
     * Starts the movement and sprite animation intervals.
     *
     * Interval 1: moves left continuously while alive.
     * Interval 2: updates the current animation frames (walking or dead).
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
     * Applies damage to the chicken unless it is already dead.
     *
     * When energy reaches 0, the chicken is transitioned into the dead state.
     *
     * @param {number} [amount=5] - Damage amount to apply.
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
     * Transitions the chicken into the dead state and stops movement.
     *
     * Sets energy to 0, disables speed, resets the animation frame index,
     * and switches to the dead sprite set.
     */
    die() {
        this.energy = 0;
        this.speed = 0;
        this.currentImage = 0;
        this.playAnimation(this.deadImages);
    }

    /**
     * Starts a periodic check that toggles loop sound playback based on player proximity.
     */
    startProximitySoundCheck() {
        setInterval(() => this.updateProximitySound(), 1000 / 10);
    }

    /**
     * Updates proximity-based loop sound playback.
     *
     * Stops sound when the chicken is dead or when sound is disabled. Otherwise,
     * starts sound when the character is within range and stops it when out of range.
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
     * Starts the loop sound if it is allowed and not already active.
     */
    startLoopSound() {
        if (this.proximitySoundActive || !this.canPlayLoopSound()) return;
        this.loopSound.loop = true;
        this.loopSound.play().catch(() => {});
        this.proximitySoundActive = true;
    }

    /**
     * Stops the loop sound playback and clears the active flag.
     */
    stopLoopSound() {
        if (!this.proximitySoundActive || !this.loopSound) return;
        this.loopSound.pause();
        this.proximitySoundActive = false;
    }

    /**
     * Checks whether loop sound playback is currently allowed.
     *
     * Requires a valid loop sound element and the global sound setting to be enabled.
     *
     * @returns {boolean} True if loop sound can be played; otherwise false.
     */
    canPlayLoopSound() {
        if (!this.loopSound) return false;
        return this.isSoundEnabled();
    }

    /**
     * Reads the persisted sound setting from localStorage.
     *
     * Uses `SOUND_ENABLED_KEY` when defined; otherwise falls back to the default key.
     *
     * @returns {boolean} True if sound is enabled; otherwise false.
     */
    isSoundEnabled() {
        const key = typeof SOUND_ENABLED_KEY === 'string' ? SOUND_ENABLED_KEY : 'sound-enabled';
        return localStorage.getItem(key) !== 'false';
    }

    /**
     * Resolves the loop sound element for the current chicken variant.
     *
     * @returns {HTMLAudioElement|null} The audio element used for looping SFX, or null if not present in the DOM.
     */
    getLoopSoundElement() {
        const id = this.isSmall ? 'smallchicken-loop-sound' : 'chicken-loop-sound';
        return document.getElementById(id);
    }
}