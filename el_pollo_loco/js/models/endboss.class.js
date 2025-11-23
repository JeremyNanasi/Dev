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
    alertInterval = null;
    isAlerting = false;
    alertOnCooldown = false;
    alertDistance = 80;

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
        this.img = this.imageCache[this.IMAGES_ENDBOSS_WALKING[0]];
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

        this.currentImage = 0;
        const frameDelay = this.frameTimers.walking || 200;

        this.walkInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_ENDBOSS_WALKING);
        }, frameDelay);
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
            const distanceAhead = this.getDistanceAhead();
            const withinAlertRange = this.isCharacterWithinAlertRange(distanceAhead);

            if (withinAlertRange && !this.isAlerting && !this.alertOnCooldown) {
                this.startAlertAnimation();
                this.alertOnCooldown = true;
                return;
            }

            if (!withinAlertRange && this.alertOnCooldown) {
                this.alertOnCooldown = false;
            }

            if (this.shouldMove()) {
                this.startWalkingAnimation();
                this.moveLeft();
            }
        }, 1000 / 60);
    }

    shouldMove() {
        if (!this.world || !this.world.character || this.isAlerting) return false;

        const distanceAhead = this.getDistanceAhead();
        const stillAheadOfCharacter = distanceAhead >= 0;
        const withinStartRange = distanceAhead <= this.startMovingDistance;
        const withinStopRange = distanceAhead <= this.stopDistance;

        return stillAheadOfCharacter && withinStartRange && withinStopRange;
    }

    startAlertAnimation() {
        if (this.alertInterval) {
            clearInterval(this.alertInterval);
        }

        this.isAlerting = true;
        this.stopWalkingAnimation();
        this.currentImage = 0;

        const frameDelay = this.frameTimers.alert || 200;
        let frameIndex = 0;

        this.alertInterval = setInterval(() => {
            this.img = this.imageCache[this.ALERT_ENBOSS[frameIndex]];
            frameIndex++;

            if (frameIndex >= this.ALERT_ENBOSS.length) {
                clearInterval(this.alertInterval);
                this.alertInterval = null;
                this.isAlerting = false;
                this.currentImage = 0;
                this.startWalkingAnimation();
            }
        }, frameDelay);
    }

    isCharacterWithinAlertRange(distanceAhead) {
        return distanceAhead >= 0 && distanceAhead <= this.alertDistance;
    }

    getDistanceAhead() {
        if (!this.world || !this.world.character) return Infinity;

        return this.x - this.world.character.x;
    }
}