class Character extends MoveableObject {

    height = 200;
    width = 240;
    y = 190;
    x = 40;
    speed = 10;
    currentFrameTime = 0;
    deadFrameDuration = 200;
    currentDeadFrameTime = 0;


    IMAGES_WALKING = [
        './img/2_character_pepe/2_walk/W-21.png',
        './img/2_character_pepe/2_walk/W-22.png',
        './img/2_character_pepe/2_walk/W-23.png',
        './img/2_character_pepe/2_walk/W-24.png',
        './img/2_character_pepe/2_walk/W-25.png',
        './img/2_character_pepe/2_walk/W-26.png'
    ];

    IMAGES_JUMPING = [
        './img/2_character_pepe/3_jump/J-31.png',
        './img/2_character_pepe/3_jump/J-32.png',
        './img/2_character_pepe/3_jump/J-33.png',
        './img/2_character_pepe/3_jump/J-34.png',
        './img/2_character_pepe/3_jump/J-35.png',
        './img/2_character_pepe/3_jump/J-36.png',
        './img/2_character_pepe/3_jump/J-37.png',
        './img/2_character_pepe/3_jump/J-38.png',
        './img/2_character_pepe/3_jump/J-39.png'
    ];

    IMAGES_DEAD = [
        './img/2_character_pepe/5_dead/D-51.png',
        './img/2_character_pepe/5_dead/D-52.png',
        './img/2_character_pepe/5_dead/D-53.png',
        './img/2_character_pepe/5_dead/D-54.png',
        './img/2_character_pepe/5_dead/D-55.png',
        './img/2_character_pepe/5_dead/D-56.png',
        './img/2_character_pepe/5_dead/D-57.png'
    ];

    IMAGES_HURT = [
        './img/2_character_pepe/4_hurt/H-41.png',
        './img/2_character_pepe/4_hurt/H-42.png',
        './img/2_character_pepe/4_hurt/H-43.png'
    ];


    world;
    // walking_sound = new Audio('audio/running.mp3')

    constructor() {
        super().loadImage('./img/2_character_pepe/2_walk/W-21.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.applyGravity();
        this.animate();
    }

updateJumpAnimation() {
    const now = Date.now();

    // Prüfen, ob genug Zeit seit letztem Frame vergangen ist
    if (now - this.lastFrameTime.jumping > this.frameTimers.jumping) {
        this.lastFrameTime.jumping += this.frameTimers.jumping;

        // Wenn kein currentImage gesetzt, 0
        if (this.currentImage === undefined || this.currentImage === null) this.currentImage = 0;

        // Solange wir nicht beim letzten Bild sind
        if (this.currentImage < this.IMAGES_JUMPING.length - 1) {
            this.img = this.imageCache[this.IMAGES_JUMPING[this.currentImage]];
            this.currentImage++;
        } else {
            // Bleibt beim letzten Frame stehen
            this.img = this.imageCache[this.IMAGES_JUMPING[this.IMAGES_JUMPING.length - 1]];
        }
    }

    // Wenn wir wieder auf dem Boden sind, currentImage zurücksetzen für nächsten Sprung
    if (!this.isAboveGround()) {
        this.currentImage = 0;
    }
}

    animate() {
        setInterval(() => {
            const now = Date.now();


            // Bewegung
            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
                this.moveRight();
                this.otherDirection = false;
            }
            if (this.world.keyboard.LEFT && this.x > 0) {
                this.moveLeft();
                this.otherDirection = true;
            }
            if (this.world.keyboard.UP && !this.isAboveGround()) {
                this.jump();
            }


            // Kamera
            this.world.camera_x = -this.x + 100;


            // Animationen
            if (this.isDead()) {
                if (now - this.lastFrameTime.dead > this.frameTimers.dead) {
                    this.lastFrameTime.dead = now;
                    this.playAnimationDead(this.IMAGES_DEAD);
                }
            } else if (this.energy !== 0) {
                if (this.isHurt()) {
                    if (now - this.lastFrameTime.hurt > this.frameTimers.hurt) {
                        this.lastFrameTime.hurt = now;
                        this.playAnimation(this.IMAGES_HURT);
                    }
                } else if (this.isAboveGround()) {
                    this.updateJumpAnimation();
                } else {
                    if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                        if (now - this.lastFrameTime.walking > this.frameTimers.walking) {
                            this.lastFrameTime.walking = now;
                            this.playAnimation(this.IMAGES_WALKING);
                        }
                    }
                }
            }
        }, 1000 / 60);
    }

jump() {
    this.speedY = 30;
}
}