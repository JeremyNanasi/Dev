class Chicken extends MoveableObject {
    height = 60;
    width = 70;
    y = 355;
    energy = 20;

    IMAGES_WALKING = [
        './img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];

    IMAGES_CHICKE_NORMAL_DEAD = [
        './img/3_enemies_chicken/chicken_normal/2_dead/dead.png'
    ];

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

        this.x = 500 + Math.random() * 500;
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
