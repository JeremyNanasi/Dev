/**
 * Endboss enemy with alert, attack, and death behaviors.
 * @extends MoveableObject
 * @property {World} world
 * @property {number} energy
 * @property {boolean} isDeadState
 * @property {EndbossLogic} logic
 */
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
    contactDamageAmount = 200;
    logic;

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
    /** Creates a new instance. */
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
        this.logic = new EndbossLogic(this);
        this.startWalkingAnimation();
        this.animate();
    }

    /**
     * Starts the endboss logic loop.
     * @returns {void}
     */
    animate() {
        this.logic.startLogicLoop();
    }
    /** Runs `startWalkingAnimation`. @returns {*} Result. */
    startWalkingAnimation() {
        if (this.walkInterval) return;
        this.currentImage = 0;
        const frameDelay = this.frameTimers.walking || 200;
        this.walkInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_ENDBOSS_WALKING);
        }, frameDelay);
    }
    /** Runs `stopWalkingAnimation`. @returns {*} Result. */
    stopWalkingAnimation() {
        if (!this.walkInterval) return;
        clearInterval(this.walkInterval);
        this.walkInterval = null;
        this.walkFrameIndex = 0;
    }
    /** Runs `enterDormantMode`. */
    enterDormantMode() {
        this.stopWalkingAnimation();
        this.clearAlertInterval();
        this.clearAttackInterval();
        this.currentImage = 0;
        this.img = this.imageCache[this.IMAGES_ENDBOSS_WALKING[0]];
    }
    /** Runs `exitDormantMode`. */
    exitDormantMode() {
        this.stopWalkingAnimation();
        this.clearAlertInterval();
        this.clearAttackInterval();
    }
    /** Runs `showWakeTelegraphFrame`. */
    showWakeTelegraphFrame() {
        this.clearAlertInterval();
        this.currentImage = 0;
        this.img = this.imageCache[this.ALERT_ENBOSS[0]];
    }
    /** Sets `setAlertFrame` state. */
    setAlertFrame() {
        this.currentImage = 0;
        this.img = this.imageCache[this.ALERT_ENBOSS[0]];
    }

    /**
     * Begins the alert animation sequence.
     * @returns {void}
     */
    startAlertAnimation() {
        if (this.shouldSkipAlert()) return;
        this.clearAlertInterval();
        this.prepareAlertState();
        this.startAlertInterval();
        this.playAlertSound();
    }
    /** Checks `shouldSkipAlert`. @returns {*} Result. */
    shouldSkipAlert() {
        return this.isDeadState || this.energy <= 0;
    }
    /** Runs `playAlertSound`. @returns {*} Result. */
    playAlertSound() {
        if (!window.EPL?.EnemySfx?.onEndbossAlertStart) return;
        window.EPL.EnemySfx.onEndbossAlertStart(this);
    }
    /** Runs `clearAlertInterval`. @returns {*} Result. */
    clearAlertInterval() {
        if (!this.alertInterval) return;
        clearInterval(this.alertInterval);
        this.alertInterval = null;
        this.isAlerting = false;
    }
    /** Runs `stopAlertLoopIfAny`. */
    stopAlertLoopIfAny() {
        this.clearAlertInterval();
    }
    /** Runs `prepareAlertState`. */
    prepareAlertState() {
        this.isAlerting = true;
        this.stopWalkingAnimation();
        this.setAlertFrame();
    }
    /** Runs `startAlertInterval`. @returns {*} Result. */
    startAlertInterval() {
        const frameDelay = this.frameTimers.alert || 200;
        let frameIndex = 1;
        this.alertInterval = setInterval(() => {
            this.img = this.imageCache[this.ALERT_ENBOSS[frameIndex]];
            frameIndex += 1;
            if (frameIndex < this.ALERT_ENBOSS.length) return;
            this.clearAlertInterval();
            this.currentImage = 0;
        }, frameDelay);
    }
    /** Checks `isCharacterWithinAlertRange`. @param {*} distanceAhead - Value. @returns {*} Result. */
    isCharacterWithinAlertRange(distanceAhead) {
        return distanceAhead >= 0 && distanceAhead <= this.alertDistance;
    }
    /** Checks `canStartAttack`. @param {*} distanceAhead - Value. @returns {*} Result. */
    canStartAttack(distanceAhead) {
        if (!this.world?.character) return false;
        const withinDistance = distanceAhead >= 0 && distanceAhead <= this.attackDistance;
        const isColliding = this.world.character.isColliding(this);
        return !this.isAttacking
            && !this.attackOnCooldown
            && !this.isAlerting
            && (withinDistance || isColliding);
    }
    /** Handles `handleAttackOrAlert`. @param {*} distanceAhead - Value. @param {*} allowAlert - Value. @returns {*} Result. */
    handleAttackOrAlert(distanceAhead, allowAlert = true) {
        if (this.canStartAttack(distanceAhead)) {
            this.startAttackAnimation();
            return true;
        }
        if (!allowAlert) return false;
        return this.handleAlertState(distanceAhead);
    }
    /** Handles `handleAlertState`. @param {*} distanceAhead - Value. @returns {*} Result. */
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
    /** Runs `startAttackAnimation`. */
    startAttackAnimation() {
        this.clearAttackInterval();
        this.clearAlertInterval();
        this.prepareAttackState();
        this.startAttackInterval();
    }
    /** Runs `clearAttackInterval`. @returns {*} Result. */
    clearAttackInterval() {
        if (!this.attackInterval) return;
        clearInterval(this.attackInterval);
        this.attackInterval = null;
        this.isAttacking = false;
    }
    /** Runs `prepareAttackState`. */
    prepareAttackState() {
        this.isAttacking = true;
        this.attackDamageApplied = false;
        this.stopWalkingAnimation();
        this.currentImage = 0;
    }
    /** Runs `startAttackInterval`. @returns {*} Result. */
    startAttackInterval() {
        const frameDelay = this.frameTimers.attack || 150;
        let frameIndex = 0;
        this.attackInterval = setInterval(() => {
            this.img = this.imageCache[this.ATTACK_ENDBOSS[frameIndex]];
            this.handleDamageDuringAttack();
            frameIndex += 1;
            if (frameIndex < this.ATTACK_ENDBOSS.length) return;
            this.clearAttackInterval();
            this.finishAttackAnimation();
        }, frameDelay);
    }
    /** Handles `handleDamageDuringAttack`. @returns {*} Result. */
    handleDamageDuringAttack() {
        if (this.attackDamageApplied || !this.world?.character) return;
        if (!this.logic.tryAttackDamage()) return;
        this.attackDamageApplied = true;
    }
    /** Runs `playHurtAnimation`. @returns {*} Result. */
    playHurtAnimation() {
        if (this.isDeadState) return;
        this.prepareHurtState();
        this.startHurtInterval();
    }
    /** Runs `clearHurtInterval`. @returns {*} Result. */
    clearHurtInterval() {
        if (!this.hurtInterval) return;
        clearInterval(this.hurtInterval);
        this.hurtInterval = null;
        this.isHurting = false;
    }
    /** Runs `prepareHurtState`. */
    prepareHurtState() {
        this.clearHurtInterval();
        this.isHurting = true;
        this.stopWalkingAnimation();
        this.clearAttackInterval();
        this.clearAlertInterval();
    }
    /** Runs `startHurtInterval`. @returns {*} Result. */
    startHurtInterval() {
        const frameDelay = this.frameTimers.hurt || 150;
        let frameIndex = 0;
        this.hurtInterval = setInterval(() => {
            this.img = this.imageCache[this.HURT_ENDBOSS[frameIndex]];
            frameIndex += 1;
            if (frameIndex < this.HURT_ENDBOSS.length) return;
            this.clearHurtInterval();
            this.currentImage = 0;
            this.startWalkingAnimation();
            this.logic.onHurtEnd();
        }, frameDelay);
    }

    /**
     * Plays the death animation and stops active behaviors.
     * @returns {void}
     */
    playDeathAnimation() {
        if (this.isDeadState) return;
        this.isDeadState = true;
        this.healthBar?.setPercentage(0);
        this.clearIntervalsForDeath();
        this.startDeathInterval();
    }
    /** Runs `clearIntervalsForDeath`. */
    clearIntervalsForDeath() {
        this.stopWalkingAnimation();
        this.logic.clearMovementInterval();
        this.clearAlertInterval();
        this.clearAttackInterval();
        this.clearHurtInterval();
    }
    /** Runs `startDeathInterval`. */
    startDeathInterval() {
        this.initializeDeathAnimation();
        const frameDelay = this.getDeathFrameDelay();
        let frameIndex = 0;
        const groundY = 450;
        this.deathInterval = setInterval(() => {
            frameIndex = this.updateDeathFrame(frameIndex, groundY);
        }, frameDelay);
    }
    /** Initializes `initializeDeathAnimation`. */
    initializeDeathAnimation() {
        this.currentImage = 0;
    }
    /** Gets `getDeathFrameDelay` data. @returns {*} Result. */
    getDeathFrameDelay() {
        return this.frameTimers.dead || 200;
    }
    /** Updates `updateDeathFrame` state. @param {*} frameIndex - Value. @param {*} groundY - Value. @returns {*} Result. */
    updateDeathFrame(frameIndex, groundY) {
        this.img = this.imageCache[this.DEAD_ENDBOSS[frameIndex]];
        if (frameIndex < this.DEAD_ENDBOSS.length - 1) return frameIndex + 1;
        this.applyDeathFall(groundY);
        return frameIndex;
    }
    /** Runs `applyDeathFall`. @param {*} groundY - Value. */
    applyDeathFall(groundY) {
        if (this.y < groundY) {
            this.y += 20;
            return;
        }
        this.y = groundY;
        clearInterval(this.deathInterval);
        this.deathInterval = null;
    }
    /** Runs `finishAttackAnimation`. */
    finishAttackAnimation() {
        this.isAttacking = false;
        this.currentImage = 0;
        this.attackOnCooldown = true;
        setTimeout(() => {
            this.attackOnCooldown = false;
        }, this.attackCooldownDuration);
        this.startWalkingAnimation();
    }
    /** Updates `updateHealthBar` state. @returns {*} Result. */
    updateHealthBar() {
        if (!this.healthBar) return;
        const percentage = Math.max(0, Math.min(100, (this.energy / 50) * 100));
        this.healthBar.setPercentage(percentage);
        this.healthBar.x = this.x + (this.width / 2) - 35;
        this.healthBar.y = this.y - 60;
    }
    /** Gets `getMinX` data. @returns {*} Result. */
    getMinX() {
        return 500;
    }
    /** Gets `getMaxX` data. @returns {*} Result. */
    getMaxX() {
        return 2500;
    }
}
