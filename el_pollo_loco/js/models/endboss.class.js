class Endboss extends MoveableObject {
    
    height = 400;
    width = 385;
    y = 60;
    speed = 0.8;
    startMovingDistance = 1000;
    stopDistance = 1500;
    world;
    walkInterval = null;
    movementInterval = null;
    walkFrameIndex = 0;

    IMAGES_ENDBOSS_WALKING = [
        './img/4_enemie_boss_chicken/1_walk/G1.png',
        './img/4_enemie_boss_chicken/1_walk/G2.png',
        './img/4_enemie_boss_chicken/1_walk/G3.png',
        './img/4_enemie_boss_chicken/1_walk/G4.png'
    ];

    ALERT_ENBOSS = [
        './img/4_enemie_boss_chicken/2_alert/G5.png',
        './img/4_enemie_boss_chicken/2_alert/G6.png',
        './img/4_enemie_boss_chicken/2_alert/G7.png',
        './img/4_enemie_boss_chicken/2_alert/G8.png',
        './img/4_enemie_boss_chicken/2_alert/G9.png',
        './img/4_enemie_boss_chicken/2_alert/G10.png',
        './img/4_enemie_boss_chicken/2_alert/G11.png',
        './img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    ATTACK_ENDBOSS = [
        './img/4_enemie_boss_chicken/3_attack/G13.png',
        './img/4_enemie_boss_chicken/3_attack/G14.png',
        './img/4_enemie_boss_chicken/3_attack/G15.png',
        './img/4_enemie_boss_chicken/3_attack/G16.png',
        './img/4_enemie_boss_chicken/3_attack/G17.png',
        './img/4_enemie_boss_chicken/3_attack/G18.png',
        './img/4_enemie_boss_chicken/3_attack/G19.png',
        './img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    HURT_ENDBOSS = [
        './img/4_enemie_boss_chicken/4_hurt/G21.png',
        './img/4_enemie_boss_chicken/4_hurt/G22.png',
        './img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    DEAD_ENDBOSS = [
        './img/4_enemie_boss_chicken/5_dead/G24.png',
        './img/4_enemie_boss_chicken/5_dead/G25.png',
        './img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    constructor() {
        super().loadImage(this.IMAGES_ENDBOSS_WALKING[0]);
        this.loadImages(this.IMAGES_ENDBOSS_WALKING);
        this.loadImages(this.ALERT_ENBOSS);
        this.loadImages(this.ATTACK_ENDBOSS);
        this.loadImages(this.HURT_ENDBOSS);
        this.loadImages(this.DEAD_ENDBOSS);
        this.x = 2500;
        this.startWalkingAnimation();
        this.animate();
    }

    animate() {
        this.startMovement();
    }

    startWalkingAnimation() {
        if (this.walkInterval) return;

        this.walkInterval = setInterval(() => {
            this.walkFrameIndex = (this.walkFrameIndex + 1) % this.IMAGES_ENDBOSS_WALKING.length;
            const framePath = this.IMAGES_ENDBOSS_WALKING[this.walkFrameIndex];
            this.img = this.imageCache[framePath];
        }, 200);
    }

    stopWalkingAnimation() {
        if (this.walkInterval) {
            clearInterval(this.walkInterval);
            this.walkInterval = null;
            this.walkFrameIndex = 0;
        }
    }

    startMovement() {
        if (this.movementInterval) {
            clearInterval(this.movementInterval);
        }

        this.movementInterval = setInterval(() => {
            if (this.shouldMove()) {
                this.moveLeft();
            }
        }, 1000 / 60);
    }



    shouldMove() {
        if (!this.world || !this.world.character) return false;

        const distanceAhead = this.x - this.world.character.x;
        const stillAheadOfCharacter = distanceAhead >= 0;
        const withinStartRange = distanceAhead <= this.startMovingDistance;
        const withinStopRange = distanceAhead <= this.stopDistance;

        return stillAheadOfCharacter && withinStartRange && withinStopRange;
    }
}