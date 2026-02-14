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

    takeDamage(amount = 5) {
        if (this.isDead()) {
            return;
        }
        super.takeDamage(amount);
        if (this.energy <= 0) {
            this.die();
        }
    }

    die() {
        this.energy = 0;
        this.speed = 0;
        this.currentImage = 0;
        this.playAnimation(this.deadImages);
    }

    startProximitySoundCheck() {
        setInterval(() => this.updateProximitySound(), 1000 / 10);
    }

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

    startLoopSound() {
        if (this.proximitySoundActive || !this.canPlayLoopSound()) return;
        this.loopSound.loop = true;
        this.loopSound.play().catch(() => {});
        this.proximitySoundActive = true;
    }

    stopLoopSound() {
        if (!this.proximitySoundActive || !this.loopSound) return;
        this.loopSound.pause();
        this.proximitySoundActive = false;
    }

    canPlayLoopSound() {
        if (!this.loopSound) return false;
        return this.isSoundEnabled();
    }

    isSoundEnabled() {
        const key = typeof SOUND_ENABLED_KEY === 'string' ? SOUND_ENABLED_KEY : 'sound-enabled';
        return localStorage.getItem(key) !== 'false';
    }

    getLoopSoundElement() {
        return document.getElementById('smallchicken-loop-sound');
    }
}
