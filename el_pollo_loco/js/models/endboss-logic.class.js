/**
 * Coordinates endboss AI state, activation, and damage application.
 */
class EndbossLogic {

    /**
     * @param {Endboss} boss
     */
    constructor(boss) {
        this.boss = boss;
        this.helpers = new EndbossLogicHelpers(this);
        this.movementInterval = null;
        this.action = this.createActionState(boss.y);
        this.jump = this.createJumpState();
        this.lastDamageTime = 0;
        this.lastSlamTime = 0;
        this.lastJumpTime = 0;
        this.isDormant = true;
        this.activatedAt = 0;
        this.wakeEndsAt = 0;
        this.hasDoneFirstSightAlert = false;
        this.didSetDormantVisual = false;
    }

    createActionState(baseY) { return { type: null, endTime: 0, direction: 0, speed: 1, startTime: 0, baseY, height: 0 }; }
    /** Creates `createJumpState` data. @returns {*} Result. */
    createJumpState() {
        return { active: false, startTime: 0, baseX: 0, baseY: 0, targetX: 0, height: 260, duration: 900, impactDone: false };
    }

    /**
     * Starts the main endboss logic interval at 60 FPS.
     * @returns {void}
     */
    startLogicLoop() { this.clearMovementInterval(); this.movementInterval = setInterval(() => { this.updateLogic(); }, 1000 / 60); }
    /** Runs `clearMovementInterval`. @returns {*} Result. */
    clearMovementInterval() {
        if (!this.movementInterval) return;
        clearInterval(this.movementInterval);
        this.movementInterval = null;
    }

    /**
     * Runs one AI tick including dormant/wake/aggressive handling.
     * @returns {void}
     */
    updateLogic() {
        const character = this.getChar();
        if (!character) return this.ensureDormantVisual();
        if (this.shouldSkipTick()) return;
        if (this.isDormant) {
            this.ensureDormantVisual();
            if (this.tryActivate(character)) return;
            return;
        }
        if (this.inWake()) return;
        this.runAggressive();
    }
    /** Runs `runAggressive`. @returns {*} Result. */
    runAggressive() {
        this.updateFacingDirection();
        if (this.helpers.updateJump()) return;
        this.applyContactDamage();
        if (this.helpers.updateAction()) return;
        if (this.helpers.tryTargetedJump()) return;
        if (this.helpers.tryJumpSlam()) return;
        if (this.helpers.trySprint()) return;
        if (this.tryAttackOrAlert()) return;
        this.helpers.handleMovement();
    }
    /** Checks `shouldSkipTick`. @returns {*} Result. */
    shouldSkipTick() {
        if (!this.boss.isHurting && !this.boss.isDeadState) return false;
        this.helpers.cancelJump();
        return true;
    }
    /** Updates `updateFacingDirection` state. @returns {*} Result. */
    updateFacingDirection() {
        if (!this.canUpdateFacing()) return;
        const direction = this.helpers.getDirectionToCharacter();
        this.boss.otherDirection = direction > 0;
    }
    /** Checks `canUpdateFacing`. @returns {*} Result. */
    canUpdateFacing() {
        if (!this.getChar()) return false;
        return !this.helpers.isActionActive()
            && !this.boss.isAlerting
            && !this.boss.isAttacking
            && !this.boss.isHurting;
    }
    /** Runs `applyContactDamage`. @returns {*} Result. */
    applyContactDamage() {
        if (!this.isOverlapping()) return;
        this.applyBossDamage(this.boss.contactDamageAmount);
    }
    /** Checks `isOverlapping`. @returns {*} Result. */
    isOverlapping() {
        const character = this.getChar();
        if (!character) return false;
        const collision = this.boss.world?.collision;
        if (!collision?.isContactDamageHit) return character.isColliding(this.boss);
        return collision.isContactDamageHit(character, this.boss, collision.getContactTuning());
    }

    getChar() { return this.boss.world?.character; }
    isCharAlive(character) { return character && !character.isDead?.(); }
    nowMs() { return Date.now(); }
    centerX(target) { return target.x + target.width / 2; }
    distX(a, b) { return Math.abs(this.centerX(a) - this.centerX(b)); }
    ensureDormantVisual() { if (this.didSetDormantVisual) return; this.didSetDormantVisual = true; this.boss.enterDormantMode(); }
    /** Runs `tryActivate`. @param {*} character - Value. @returns {*} Result. */
    tryActivate(character) {
        if (!this.isCharAlive(character) || this.distX(this.boss, character) > 600) return false;
        const now = this.nowMs();
        this.isDormant = false; this.activatedAt = now;
        this.boss.exitDormantMode();
        if (this.hasDoneFirstSightAlert) return true;
        this.hasDoneFirstSightAlert = true;
        const frameDelay = this.boss.frameTimers?.alert || 200;
        this.wakeEndsAt = now + frameDelay * this.boss.ALERT_ENBOSS.length;
        this.boss.startAlertAnimation();
        return true;
    }

    inWake() { return this.nowMs() < this.wakeEndsAt; }
    /** Checks `isBossBusy`. @returns {*} Result. */
    isBossBusy() {
        return this.boss.isHurting
            || this.boss.isDeadState
            || this.boss.isAttacking
            || this.boss.isAlerting
            || this.helpers.isActionActive();
    }
    /** Runs `tryAttackOrAlert`. @returns {*} Result. */
    tryAttackOrAlert() {
        const distanceAhead = this.getDistanceAhead();
        return this.boss.handleAttackOrAlert(distanceAhead, !this.hasDoneFirstSightAlert);
    }
    /** Gets `getDistanceAhead` data. @returns {*} Result. */
    getDistanceAhead() {
        const character = this.getChar();
        if (!character) return Infinity;
        return this.boss.x - (character.x + character.width);
    }
    /** Runs `onHurtEnd`. @returns {*} Result. */
    onHurtEnd() {
        if (this.isDormant || this.inWake()) { this.boss.enterDormantMode(); return; }
        if (this.boss.isDeadState || this.helpers.isActionActive()) return;
        if (this.helpers.isMidRange()) this.helpers.startSprintTelegraph();
    }
    /** Runs `tryAttackDamage`. @returns {*} Result. */
    tryAttackDamage() {
        if (!this.isOverlapping()) return false;
        return this.applyBossDamage(this.boss.contactDamageAmount);
    }
    /** Runs `applyBossDamage`. @param {*} amount - Value. @returns {*} Result. */
    applyBossDamage(amount = this.boss.contactDamageAmount) {
        if (!this.canDealDamage()) return false;
        this.commitDamage(amount);
        return true;
    }
    /** Runs `commitDamage`. @param {*} amount - Value. @returns {*} Result. */
    commitDamage(amount) {
        const character = this.getChar();
        if (!character) return;
        character.takeDamage(amount);
        this.lastDamageTime = this.nowMs();
        this.updatePlayerHud(character);
    }
    /** Checks `canDealDamage`. @returns {*} Result. */
    canDealDamage() {
        return this.nowMs() - this.lastDamageTime >= 900;
    }
    /** Updates `updatePlayerHud` state. @param {*} character - Value. */
    updatePlayerHud(character) {
        const percentage = (character.energy / 600) * 100;
        this.boss.world?.statusBar?.setPercentage(percentage);
    }
}