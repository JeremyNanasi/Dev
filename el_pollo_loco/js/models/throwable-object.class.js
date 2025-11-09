class ThrowableObject extends MoveableObject {

    IMAGE_ROTATION = [
        './img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
    ];

    IMAGE_SPLASH = [
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ];

    IMAGE_SALSA_GROUND = [
        './img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
        './img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
    ];

    groundAnimationInterval;

    constructor(x, y, options = {}) {
        super();
        this.loadImage(this.IMAGE_ROTATION[0]);
        this.loadImages(this.IMAGE_ROTATION);
        this.loadImages(this.IMAGE_SPLASH);
        this.loadImages(this.IMAGE_SALSA_GROUND);

        this.height = 100;
        this.width = 100;

        const hasCoordinates = typeof x === 'number' && typeof y === 'number';
        const isCollectible = options.isCollectible ?? !hasCoordinates;

        if (isCollectible) {
            this.spawnCollectible(
                hasCoordinates ? x : 200 + Math.random() * 500,
                hasCoordinates ? y : 360
            );
        } else if (hasCoordinates) {
            this.throw(x, y);
        } else {
            throw new Error('ThrowableObject requires coordinates when not used as collectible.');
        }
    }

    spawnCollectible(x, y) {
        this.x = x;
        this.y = y;
        this.currentImage = 0;
        this.img = this.imageCache[this.IMAGE_SALSA_GROUND[0]];
        this.startGroundAnimation();
    }

    startGroundAnimation() {
        this.stopGroundAnimation();
        this.groundAnimationInterval = setInterval(() => {
            this.playAnimation(this.IMAGE_SALSA_GROUND);
        }, 400);
    }

    stopGroundAnimation() {
        if (this.groundAnimationInterval) {
            clearInterval(this.groundAnimationInterval);
            this.groundAnimationInterval = null;
        }
    }

    throw(x, y) {
        this.stopGroundAnimation();
        this.x = x;
        this.y = y;
        this.speedY = 30;
        this.applyGravity();
        setInterval(() => {
            this.playAnimation(this.IMAGE_ROTATION);
            this.x += 10;
        }, 25);
    }   
}