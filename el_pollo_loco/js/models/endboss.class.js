class Endboss extends MoveableObject {
    
    height = 400;
    width = 385;
    y = 60;
    speed = 0.8;
    energy = 120;
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
    attackInterval = null;
    isAttacking = false;
    attackOnCooldown = false;
    attackDistance = 0;
    attackCooldownDuration = 1400;
    attackDamageApplied = false;
    contactDamageAmount = 20;
    contactDamageCooldown = 1000;
    lastContactDamageTime = 0;

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
            this.updateFacingDirection();
            this.applyContactDamageIfColliding();
            const distanceAhead = this.getDistanceAhead();
            const withinAttackRange = this.canStartAttack();
            const withinAlertRange = this.isCharacterWithinAlertRange(distanceAhead);

            if (withinAttackRange) {
                this.startAttackAnimation();
                return;
            }

            if (withinAlertRange && !this.isAlerting && !this.alertOnCooldown && !this.isAttacking) {
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
        if (!this.world || !this.world.character || this.isAlerting || this.isAttacking) return false;

        const distanceAhead = this.getDistanceAhead();
        const stillAheadOfCharacter = distanceAhead >= - 100;
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

        this.img = this.imageCache[this.ALERT_ENBOSS[0]];
        let frameIndex = 1;

        this.alertInterval = setInterval(() => {
            this.img = this.imageCache[this.ALERT_ENBOSS[frameIndex]];
            frameIndex++;

            if (frameIndex >= this.ALERT_ENBOSS.length) {
                clearInterval(this.alertInterval);
                this.alertInterval = null;
                this.isAlerting = false;
                this.currentImage = 0;
            }
        }, frameDelay);
    }

    isCharacterWithinAlertRange(distanceAhead) {
        return distanceAhead >= 0 && distanceAhead <= this.alertDistance;
    }

    isCharacterWithinAttackRange(distanceAhead) {
        return distanceAhead >= 0 && distanceAhead <= this.attackDistance;
    }

    canStartAttack(distanceAhead) {
        if (!this.world?.character) return false;

        const withinDistance = distanceAhead >= 0 && distanceAhead <= this.attackDistance;
        const isColliding = this.world.character.isColliding(this);

        return !this.isAttacking
            && !this.attackOnCooldown
            && !this.isAlerting
            && (withinDistance || isColliding);
    }

    startAttackAnimation() {
        if (this.attackInterval) {
            clearInterval(this.attackInterval);
        }

        if (this.alertInterval) {
            clearInterval(this.alertInterval);
            this.alertInterval = null;
            this.isAlerting = false;
        }

        this.isAttacking = true;
        this.attackDamageApplied = false;
        this.stopWalkingAnimation();
        this.currentImage = 0;

        const frameDelay = this.frameTimers.attack || 150;
        let frameIndex = 0;

        this.attackInterval = setInterval(() => {
            this.img = this.imageCache[this.ATTACK_ENDBOSS[frameIndex]];
            this.handleDamageDuringAttack();
            frameIndex++;

            if (frameIndex >= this.ATTACK_ENDBOSS.length) {
                clearInterval(this.attackInterval);
                this.attackInterval = null;
                this.finishAttackAnimation();
            }
        }, frameDelay);
    }

        handleDamageDuringAttack() {
        if (this.attackDamageApplied || !this.world?.character) {
            return;
        }

        if (!this.world.character.isColliding(this)) {
            return;
        }

        this.attackDamageApplied = true;
        this.world.character.hit();
        this.world.statusBar?.setPercentage(this.world.character.energy);
    }

        applyContactDamageIfColliding() {
        if (!this.world?.character) {
            return;
        }

        if (!this.world.character.isColliding(this)) {
            return;
        }

        const now = Date.now();
        if (now - this.lastContactDamageTime < this.contactDamageCooldown) {
            return;
        }

        this.lastContactDamageTime = now;
        this.world.character.hit(this.contactDamageAmount);
        this.world.statusBar?.setPercentage(this.world.character.energy);
    }

    finishAttackAnimation() {
        this.isAttacking = false;
        this.currentImage = 0;
        this.attackOnCooldown = true;

        setTimeout(() => {
            this.attackOnCooldown = false;
        }, this.attackCooldownDuration);

        this.startWalkingAnimation();
    }

    getDistanceAhead() {
        if (!this.world || !this.world.character) return Infinity;

        return this.x - (this.world.character.x + this.world.character.width);
    }

    updateFacingDirection() {
        if (!this.world || !this.world.character) return;

        const endbossCenter = this.x + this.width / 2;
        const characterCenter = this.world.character.x + this.world.character.width / 2;
        this.otherDirection = characterCenter > endbossCenter;
    }
}