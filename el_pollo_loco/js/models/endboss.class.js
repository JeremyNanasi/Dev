/**
 * @fileoverview
 * Defines `Endboss`, the boss enemy entity with alert/attack/death behaviors and logic integration.
 *
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

    /**
     * Initializes a new methods instance and sets up default runtime state.
     * The constructor prepares dependencies used by class behavior.
     */
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
     * Executes the animate routine.
     * The logic is centralized here for maintainability.
     */
    animate() {
        this.logic.startLogicLoop();
    }

    /**
     * Starts walking animation.
     * The operation is isolated here to keep behavior predictable.
     */
    startWalkingAnimation() {
        if (this.walkInterval) return;
        this.currentImage = 0;
        const frameDelay = this.frameTimers.walking || 200;
        this.walkInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_ENDBOSS_WALKING);
        }, frameDelay);
    }

    /**
     * Stops walking animation.
     * The operation is isolated here to keep behavior predictable.
     */
    stopWalkingAnimation() {
        if (!this.walkInterval) return;
        clearInterval(this.walkInterval);
        this.walkInterval = null;
        this.walkFrameIndex = 0;
    }

    /**
     * Handles entering dormant mode.
     * The operation is isolated here to keep behavior predictable.
     */
    enterDormantMode() {
        this.stopWalkingAnimation();
        this.clearAlertInterval();
        this.clearAttackInterval();
        this.currentImage = 0;
        this.img = this.imageCache[this.IMAGES_ENDBOSS_WALKING[0]];
    }

    /**
     * Handles leaving dormant mode.
     * The operation is isolated here to keep behavior predictable.
     */
    exitDormantMode() {
        this.stopWalkingAnimation();
        this.clearAlertInterval();
        this.clearAttackInterval();
    }

    /**
     * Shows wake telegraph frame.
     * The operation is isolated here to keep behavior predictable.
     */
    showWakeTelegraphFrame() {
        this.clearAlertInterval();
        this.currentImage = 0;
        this.img = this.imageCache[this.ALERT_ENBOSS[0]];
    }

    /**
     * Sets the alert frame.
     * This keeps persistent and in-memory state aligned.
     */
    setAlertFrame() {
        this.currentImage = 0;
        this.img = this.imageCache[this.ALERT_ENBOSS[0]];
    }

    /**
     * Starts alert animation.
     * The operation is isolated here to keep behavior predictable.
     */
    startAlertAnimation() {
        if (this.shouldSkipAlert()) return;
        this.clearAlertInterval();
        this.prepareAlertState();
        this.startAlertInterval();
        this.playAlertSound();
    }

    /**
     * Evaluates the skip alert condition.
     * Returns whether the current runtime state satisfies that condition.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    shouldSkipAlert() {
        return this.isDeadState || this.energy <= 0;
    }

    /**
     * Plays alert sound.
     * The operation is isolated here to keep behavior predictable.
     */
    playAlertSound() {
        if (!window.EPL?.EnemySfx?.onEndbossAlertStart) return;
        window.EPL.EnemySfx.onEndbossAlertStart(this);
    }

    /**
     * Executes the clear alert interval routine.
     * The logic is centralized here for maintainability.
     */
    clearAlertInterval() {
        if (!this.alertInterval) return;
        clearInterval(this.alertInterval);
        this.alertInterval = null;
        this.isAlerting = false;
    }

    /**
     * Stops alert loop if any.
     * The operation is isolated here to keep behavior predictable.
     */
    stopAlertLoopIfAny() {
        this.clearAlertInterval();
    }

    /**
     * Executes the prepare alert state routine.
     * The logic is centralized here for maintainability.
     */
    prepareAlertState() {
        this.isAlerting = true;
        this.stopWalkingAnimation();
        this.setAlertFrame();
    }

    /**
     * Starts alert interval.
     * The operation is isolated here to keep behavior predictable.
     */
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

    /**
     * Evaluates the character within alert range condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {number} distanceAhead - Numeric value used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isCharacterWithinAlertRange(distanceAhead) {
        return distanceAhead >= 0 && distanceAhead <= this.alertDistance;
    }

    /**
     * Evaluates the start attack condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {number} distanceAhead - Numeric value used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    canStartAttack(distanceAhead) {
        if (!this.world?.character) return false;
        const withinDistance = distanceAhead >= 0 && distanceAhead <= this.attackDistance;
        const isColliding = this.world.character.isColliding(this);
        return !this.isAttacking
            && !this.attackOnCooldown
            && !this.isAlerting
            && (withinDistance || isColliding);
    }

    /**
     * Handles attack or alert.
     * It applies side effects required by this branch.
     * @param {number} distanceAhead - Numeric value used by this routine.
     * @param {boolean} allowAlert - Boolean flag controlling this branch.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    handleAttackOrAlert(distanceAhead, allowAlert = true) {
        if (this.canStartAttack(distanceAhead)) {
            this.startAttackAnimation();
            return true;
        }
        if (!allowAlert) return false;
        return this.handleAlertState(distanceAhead);
    }

    /**
     * Handles alert state.
     * It applies side effects required by this branch.
     * @param {number} distanceAhead - Numeric value used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
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

    /**
     * Starts attack animation.
     * The operation is isolated here to keep behavior predictable.
     */
    startAttackAnimation() {
        this.clearAttackInterval();
        this.clearAlertInterval();
        this.prepareAttackState();
        this.startAttackInterval();
    }

    /**
     * Executes the clear attack interval routine.
     * The logic is centralized here for maintainability.
     */
    clearAttackInterval() {
        if (!this.attackInterval) return;
        clearInterval(this.attackInterval);
        this.attackInterval = null;
        this.isAttacking = false;
    }

    /**
     * Executes the prepare attack state routine.
     * The logic is centralized here for maintainability.
     */
    prepareAttackState() {
        this.isAttacking = true;
        this.attackDamageApplied = false;
        this.stopWalkingAnimation();
        this.currentImage = 0;
    }

    /**
     * Starts attack interval.
     * The operation is isolated here to keep behavior predictable.
     */
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

    /**
     * Handles damage during attack.
     * It applies side effects required by this branch.
     */
    handleDamageDuringAttack() {
        if (this.attackDamageApplied || !this.world?.character) return;
        if (!this.logic.tryAttackDamage()) return;
        this.attackDamageApplied = true;
    }

    /**
     * Plays hurt animation.
     * The operation is isolated here to keep behavior predictable.
     */
    playHurtAnimation() {
        if (this.isDeadState) return;
        this.prepareHurtState();
        this.startHurtInterval();
    }

    /**
     * Executes the clear hurt interval routine.
     * The logic is centralized here for maintainability.
     */
    clearHurtInterval() {
        if (!this.hurtInterval) return;
        clearInterval(this.hurtInterval);
        this.hurtInterval = null;
        this.isHurting = false;
    }

    /**
     * Executes the prepare hurt state routine.
     * The logic is centralized here for maintainability.
     */
    prepareHurtState() {
        this.clearHurtInterval();
        this.isHurting = true;
        this.stopWalkingAnimation();
        this.clearAttackInterval();
        this.clearAlertInterval();
    }

    /**
     * Starts hurt interval.
     * The operation is isolated here to keep behavior predictable.
     */
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
     * Plays death animation.
     * The operation is isolated here to keep behavior predictable.
     */
    playDeathAnimation() {
        if (this.isDeadState) return;
        this.isDeadState = true;
        this.healthBar?.setPercentage(0);
        this.clearIntervalsForDeath();
        this.startDeathInterval();
    }

    /**
     * Executes the clear intervals for death routine.
     * The logic is centralized here for maintainability.
     */
    clearIntervalsForDeath() {
        this.stopWalkingAnimation();
        this.logic.clearMovementInterval();
        this.clearAlertInterval();
        this.clearAttackInterval();
        this.clearHurtInterval();
    }

    /**
     * Starts death interval.
     * The operation is isolated here to keep behavior predictable.
     */
    startDeathInterval() {
        this.initializeDeathAnimation();
        const frameDelay = this.getDeathFrameDelay();
        let frameIndex = 0;
        const groundY = 450;
        this.deathInterval = setInterval(() => {
            frameIndex = this.updateDeathFrame(frameIndex, groundY);
        }, frameDelay);
    }

    /**
     * Initializes death animation.
     * It is part of the module startup flow.
     */
    initializeDeathAnimation() {
        this.currentImage = 0;
    }

    /**
     * Returns the death frame delay.
     * This helper centralizes read access for callers.
     * @returns {number} Returns the computed numeric value.
     */
    getDeathFrameDelay() {
        return this.frameTimers.dead || 200;
    }

    /**
     * Updates death frame.
     * This synchronizes runtime state with current inputs.
     * @param {number} frameIndex - Numeric value used by this routine.
     * @param {number} groundY - Numeric value used by this routine.
     * @returns {number} Returns the computed numeric value.
     */
    updateDeathFrame(frameIndex, groundY) {
        this.img = this.imageCache[this.DEAD_ENDBOSS[frameIndex]];
        if (frameIndex < this.DEAD_ENDBOSS.length - 1) return frameIndex + 1;
        this.applyDeathFall(groundY);
        return frameIndex;
    }

    /**
     * Applies death fall.
     * The operation is isolated here to keep behavior predictable.
     * @param {number} groundY - Numeric value used by this routine.
     */
    applyDeathFall(groundY) {
        if (this.y < groundY) {
            this.y += 20;
            return;
        }
        this.y = groundY;
        clearInterval(this.deathInterval);
        this.deathInterval = null;
    }

    /**
     * Executes the finish attack animation routine.
     * The logic is centralized here for maintainability.
     */
    finishAttackAnimation() {
        this.isAttacking = false;
        this.currentImage = 0;
        this.attackOnCooldown = true;
        setTimeout(() => {
            this.attackOnCooldown = false;
        }, this.attackCooldownDuration);
        this.startWalkingAnimation();
    }

    /**
     * Updates health bar.
     * This synchronizes runtime state with current inputs.
     */
    updateHealthBar() {
        if (!this.healthBar) return;
        const percentage = Math.max(0, Math.min(100, (this.energy / 50) * 100));
        this.healthBar.setPercentage(percentage);
        this.healthBar.x = this.x + (this.width / 2) - 35;
        this.healthBar.y = this.y - 60;
    }

    /**
     * Returns the min x.
     * This helper centralizes read access for callers.
     * @returns {number} Returns the computed numeric value.
     */
    getMinX() {
        return 500;
    }

    /**
     * Returns the max x.
     * This helper centralizes read access for callers.
     * @returns {number} Returns the computed numeric value.
     */
    getMaxX() {
        return 2500;
    }
}
