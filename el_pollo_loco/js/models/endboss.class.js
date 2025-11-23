class Endboss extends MoveableObject {
    
    height = 400;
    width = 385;
    y = 60;
    speed = 0.8;
    startMovingDistance = 1000;
    stopDistance = 1500;
    world;

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

    alertAnimationPlayed = false;
    alertIntervalId = null;

    constructor() {
        super().loadImage(this.IMAGES_ENDBOSS_WALKING[0]);
        this.loadImage(this.IMAGES_ENDBOSS_WALKING);
        this.loadImages(this.ALERT_ENBOSS);
        this.loadImages(this.ATTACK_ENDBOSS);
        this.loadImages(this.HURT_ENDBOSS);
        this.loadImages(this.DEAD_ENDBOSS);
        this.x = 2500;
        this.animateEnboss();
    }

    animateEnboss() {
        setInterval(() => {
            this.moveLeft();
        }, 1000 / 60);

        setInterval(() => {
                this.playAnimation(this.IMAGES_ENDBOSS_WALKING);
        }, 200);
    }

    shouldMove() {
        return this.world && this.world.character && this.world.character.x >= this.activationX;
    }
}