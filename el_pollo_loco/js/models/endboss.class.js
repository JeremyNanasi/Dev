class Endboss extends MoveableObject {
    
    height = 400;
    width = 385;
    y = 60;
    speed = 0.8;
    energy = 50;
    hitboxOffsetX = 60;
    hitboxOffsetY = 70;
    hitboxWidth = 250;
    hitboxHeight = 300;
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
    hurtInterval = null;
    isHurting = false;
    deathInterval = null;
    isDeadState = false;
    attackDistance = 0;
    attackCooldownDuration = 1400;
    attackDamageApplied = false;
    contactDamageAmount = 300;
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
        this.healthBar = new StatusBar('endboss');
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
        this.clearMovementInterval();
        this.movementInterval = setInterval(() => {
            if (this.shouldSkipMovementTick()) return;
            this.updateFacingDirection();
            this.applyContactDamageIfColliding();
            const distanceAhead = this.getDistanceAhead();
            if (this.handleAttackOrAlert(distanceAhead)) return;
            this.handleMovement();
        }, 1000 / 60);
    }

    handleMovement() {
        const characterDead = this.world?.character?.isDead?.();
        const direction = this.getMovementDirection();

        if (characterDead) {
            if (this.canMoveLeft()) {
                this.otherDirection = false;
                this.startWalkingAnimation();
                this.moveLeft();
            } else {
                this.stopWalkingAnimation();
            }
            return;
        }

        if (direction === 0 || !this.canMoveInDirection(direction)) {
            this.stopWalkingAnimation();
            return;
        }

        this.startWalkingAnimation();
        if (direction < 0) {
            this.otherDirection = false;
            this.moveLeft();
        } else {
            this.otherDirection = true;
            this.moveRight();
        }
    }

    getMovementDirection() {
        if (!this.world?.character) return 0;
        if (this.isAlerting || this.isAttacking || this.isHurting) return 0;

        const endbossCenter = this.x + this.width / 2;
        const characterCenter = this.world.character.x + this.world.character.width / 2;
        const distance = Math.abs(endbossCenter - characterCenter);

        if (distance > this.startMovingDistance) return 0;
        if (distance < 50) return 0;

        return characterCenter < endbossCenter ? -1 : 1;
    }

    canMoveInDirection(direction) {
        if (direction < 0) {
            return this.canMoveLeft();
        }
        return this.canMoveRight();
    }

    canMoveLeft() {
        const minX = this.getMinX();
        return this.x > minX;
    }

    canMoveRight() {
        const maxX = this.getMaxX();
        return this.x < maxX;
    }

    getMinX() {
        return 500;
    }

    getMaxX() {
        return 2500;
    }

    clearMovementInterval() {
        if (!this.movementInterval) return;
        clearInterval(this.movementInterval);
        this.movementInterval = null;
    }

    shouldSkipMovementTick() {
        return this.isHurting || this.isDeadState;
    }

    handleAttackOrAlert(distanceAhead) {
        if (this.canStartAttack(distanceAhead)) {
            this.startAttackAnimation();
            return true;
        }
        return this.handleAlertState(distanceAhead);
    }

    handleAlertState(distanceAhead) {
        const withinAlertRange = this.isCharacterWithinAlertRange(distanceAhead);
        if (withinAlertRange && !this.isAlerting && !this.alertOnCooldown && !this.isAttacking) {
            this.startAlertAnimation();
            this.alertOnCooldown = true;
            return true;
        }
        if (!withinAlertRange && this.alertOnCooldown) this.alertOnCooldown = false;
        return false;
    }


    startAlertAnimation() {
        if (this.isDeadState || this.energy <= 0) return;
        this.clearAlertInterval();
        this.prepareAlertState();
        this.startAlertInterval();
        if (window.EPL?.EnemySfx?.onEndbossAlertStart) {
            window.EPL.EnemySfx.onEndbossAlertStart(this);
        }
    }

    clearAlertInterval() {
        if (!this.alertInterval) return;
        clearInterval(this.alertInterval);
        this.alertInterval = null;
        this.isAlerting = false;
    }

    prepareAlertState() {
        this.isAlerting = true;
        this.stopWalkingAnimation();
        this.currentImage = 0;
        this.img = this.imageCache[this.ALERT_ENBOSS[0]];
    }

    startAlertInterval() {
        const frameDelay = this.frameTimers.alert || 200;
        let frameIndex = 1;
        this.alertInterval = setInterval(() => {
            this.img = this.imageCache[this.ALERT_ENBOSS[frameIndex]];
            frameIndex++;
            if (frameIndex >= this.ALERT_ENBOSS.length) {
                this.clearAlertInterval();
                this.currentImage = 0;
            }
        }, frameDelay);
    }

    isCharacterWithinAlertRange(distanceAhead) {
        return distanceAhead >= 0 && distanceAhead <= this.alertDistance;
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
        this.clearAttackInterval();
        this.clearAlertInterval();
        this.prepareAttackState();
        this.startAttackInterval();
    }

    clearAttackInterval() {
        if (!this.attackInterval) return;
        clearInterval(this.attackInterval);
        this.attackInterval = null;
        this.isAttacking = false;
    }

    prepareAttackState() {
        this.isAttacking = true;
        this.attackDamageApplied = false;
        this.stopWalkingAnimation();
        this.currentImage = 0;
    }

    startAttackInterval() {
        const frameDelay = this.frameTimers.attack || 150;
        let frameIndex = 0;
        this.attackInterval = setInterval(() => {
            this.img = this.imageCache[this.ATTACK_ENDBOSS[frameIndex]];
            this.handleDamageDuringAttack();
            frameIndex++;
            if (frameIndex >= this.ATTACK_ENDBOSS.length) {
                this.clearAttackInterval();
                this.finishAttackAnimation();
            }
        }, frameDelay);
    }

    handleDamageDuringAttack() {
        if (this.attackDamageApplied || !this.world?.character) {
            return;
        }

        const collisionConfig = this.world.getCollisionConfig?.();
        if (!collisionConfig) return;
        if (!this.world.isSideHit?.(this.world.character, this, collisionConfig)) {
            return;
        }

        this.attackDamageApplied = true;
        this.world.character.hit();
        this.world.statusBar?.setPercentage(this.world.character.energy);
    }

    applyContactDamageIfColliding() {
        if (!this.canApplyContactDamage()) return;
        this.world.character.hit(this.contactDamageAmount);
        this.world.statusBar?.setPercentage(this.world.character.energy);
    }

    canApplyContactDamage() {
        if (!this.world?.character) return false;
        const collisionConfig = this.world.getCollisionConfig?.();
        if (!collisionConfig) return false;

        if (!this.world.isSideHit?.(this.world.character, this, collisionConfig)) {
            return false;
        }

        const now = Date.now();
        if (now - this.lastContactDamageTime < this.contactDamageCooldown) return false;
        this.lastContactDamageTime = now;
        return true;
    }

    playHurtAnimation() {
        if (this.isDeadState) return;
        this.prepareHurtState();
        this.startHurtInterval();
    }

    clearHurtInterval() {
        if (!this.hurtInterval) return;
        clearInterval(this.hurtInterval);
        this.hurtInterval = null;
        this.isHurting = false;
    }

    prepareHurtState() {
        this.clearHurtInterval();
        this.isHurting = true;
        this.stopWalkingAnimation();
        this.clearAttackInterval();
        this.clearAlertInterval();
    }

    startHurtInterval() {
        const frameDelay = this.frameTimers.hurt || 150;
        let frameIndex = 0;
        this.hurtInterval = setInterval(() => {
            this.img = this.imageCache[this.HURT_ENDBOSS[frameIndex]];
            frameIndex++;
            if (frameIndex >= this.HURT_ENDBOSS.length) {
                this.clearHurtInterval();
                this.currentImage = 0;
                this.startWalkingAnimation();
            }
        }, frameDelay);
    }

    playDeathAnimation() {
        if (this.isDeadState) return;
        this.isDeadState = true;
        this.healthBar?.setPercentage(0);
        this.clearIntervalsForDeath();
        this.startDeathInterval();
    }

    clearWalkInterval() {
        if (!this.walkInterval) return;
        clearInterval(this.walkInterval);
        this.walkInterval = null;
    }

    clearIntervalsForDeath() {
        this.clearWalkInterval();
        this.clearMovementInterval();
        this.clearAlertInterval();
        this.clearAttackInterval();
        this.clearHurtInterval();
    }

    startDeathInterval() {
        this.initializeDeathAnimation();
        const frameDelay = this.getDeathFrameDelay();
        let frameIndex = 0;
        const groundY = 450;
        this.deathInterval = setInterval(() => {
            frameIndex = this.updateDeathFrame(frameIndex, groundY);
        }, frameDelay);
    }

    initializeDeathAnimation() {
        this.currentImage = 0;
    }

    getDeathFrameDelay() {
        return this.frameTimers.dead || 200;
    }

    updateDeathFrame(frameIndex, groundY) {
        this.img = this.imageCache[this.DEAD_ENDBOSS[frameIndex]];
        if (frameIndex < this.DEAD_ENDBOSS.length - 1) return frameIndex + 1;
        this.applyDeathFall(groundY);
        return frameIndex;
    }

    applyDeathFall(groundY) {
        if (this.y < groundY) {
            this.y += 20;
            return;
        }
        this.y = groundY;
        clearInterval(this.deathInterval);
        this.deathInterval = null;
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
        if (this.isAlerting || this.isAttacking || this.isHurting) return;

        const endbossCenter = this.x + this.width / 2;
        const characterCenter = this.world.character.x + this.world.character.width / 2;
        this.otherDirection = characterCenter > endbossCenter;
    }

    updateHealthBar() {
        if (!this.healthBar) {
            return;
        }

        const percentage = Math.max(0, Math.min(100, (this.energy / 50) * 100));
        this.healthBar.setPercentage(percentage);
        this.healthBar.x = this.x + (this.width / 2) - 35;
        this.healthBar.y = this.y - 60;
    }
}