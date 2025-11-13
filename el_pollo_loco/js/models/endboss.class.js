class Endboss extends MoveableObject {
    
    height = 400;
    width = 385; 
    y = 60;

    IMAGES_WALKING = [
        './4_enemie_boss_chicken/1_walk/G1.png',
        './4_enemie_boss_chicken/1_walk/G2.png',
        './4_enemie_boss_chicken/1_walk/G3.png',
        './4_enemie_boss_chicken/1_walk/G4.png'
    ];

    ALERT = [
        './4_enemie_boss_chicken/2_alert/G5.png',
        './4_enemie_boss_chicken/2_alert/G6.png',
        './4_enemie_boss_chicken/2_alert/G7.png',
        './4_enemie_boss_chicken/2_alert/G8.png',
        './4_enemie_boss_chicken/2_alert/G9.png',
        './4_enemie_boss_chicken/2_alert/G10.png',
        './4_enemie_boss_chicken/2_alert/G11.png',
        './4_enemie_boss_chicken/2_alert/G12.png'
    ];

    ATTACK = [
        './4_enemie_boss_chicken/3_attack/G13.png',
        './4_enemie_boss_chicken/3_attack/G14.png',
        './4_enemie_boss_chicken/3_attack/G15.png',
        './4_enemie_boss_chicken/3_attack/G16.png',
        './4_enemie_boss_chicken/3_attack/G17.png',
        './4_enemie_boss_chicken/3_attack/G18.png',
        './4_enemie_boss_chicken/3_attack/G19.png',
        './4_enemie_boss_chicken/3_attack/G20.png'
    ];

    HURT = [
        './4_enemie_boss_chicken/4_hurt/G21.png',
        './4_enemie_boss_chicken/4_hurt/G22.png',
        './4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    DEAD = [
        './4_enemie_boss_chicken/5_dead/G24.png',
        './4_enemie_boss_chicken/5_dead/G25.png',
        './4_enemie_boss_chicken/5_dead/G26.png'
    ];

    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        // this.x = 2500;
        this.x = 300;
        this.animate();
    }

    animate() {
        this.playAnimation(this.IMAGES_WALKING);
    }
}