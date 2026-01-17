class smallchicken extends MoveableObject {
    height = 50;
    width = 60;
    y = 365;
    energy = 20;
    hitboxOffsetX = 0;
    hitboxOffsetY = -5;
    hitboxWidth = 50;
    hitboxHeight = 45;

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

        this.animate();
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

    hit(amount = 5) {
        if (this.isDead()) {
            return;
        }
        super.hit(amount);
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
}