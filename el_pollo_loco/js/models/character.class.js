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

    IMAGES_JUMP_START = [
        './img/2_character_pepe/3_jump/J-31.png',
        './img/2_character_pepe/3_jump/J-32.png',
        './img/2_character_pepe/3_jump/J-33.png'
    ];

    IMAGES_JUMP_MIDAIR = [
        './img/2_character_pepe/3_jump/J-34.png',
        './img/2_character_pepe/3_jump/J-35.png',
        './img/2_character_pepe/3_jump/J-36.png',
        './img/2_character_pepe/3_jump/J-37.png'
    ];

    IMAGES_JUMP_LANDING = [
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
        this.loadImages(this.IMAGES_JUMP_START);
        this.loadImages(this.IMAGES_JUMP_MIDAIR);
        this.loadImages(this.IMAGES_JUMP_LANDING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.applyGravity();
        this.animate();
    }

    updateJumpAnimationPhased() {
        const now = Date.now();

        // Animation während des Sprungs
        if (now - this.lastFrameTime.jumping >= this.frameTimers.jumping) {
            this.lastFrameTime.jumping = now;

            if (this.speedY > 20) {
                this.playAnimation(this.IMAGES_JUMP_START);
            } else if (this.speedY > -10) {
                this.playAnimation(this.IMAGES_JUMP_MIDAIR);
            } else {
                this.playAnimation(this.IMAGES_JUMP_LANDING);
            }
        }

        if (!this.isAboveGround() && this.wasInAir) {
            this.wasInAir = false;
            this.onLanding();
        }

        if (this.isAboveGround()) {
            this.wasInAir = true;
        }
    }

    onLanding() {
        setTimeout(() => {
            this.currentImage = 0;
            this.img = this.imageCache[this.IMAGES_WALKING[0]];
        }, 150); 
    }

    animate() {
        setInterval(() => {
            const now = Date.now();

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

            this.world.camera_x = -this.x + 100;

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
                    this.updateJumpAnimationPhased();
                } else {
                    if (!this.world.keyboard.RIGHT && !this.world.keyboard.LEFT) {
                        this.currentImage = this.IMAGES_JUMP_LANDING.length - 1;
                        this.img = this.imageCache[this.IMAGES_JUMP_LANDING[this.currentImage]];
                    } else {
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
        if (!this.isAboveGround()) {
            this.speedY = 30;
            this.currentImage = 0;
            this.lastFrameTime.jumping = Date.now();
        }
    }
}