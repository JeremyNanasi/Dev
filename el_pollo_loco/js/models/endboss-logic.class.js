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
    
    createJumpState() {
        return { active: false, startTime: 0, baseX: 0, baseY: 0, targetX: 0, height: 260, duration: 900, impactDone: false };
    }

    /**
     * Starts the main endboss logic interval at 60 FPS.
     * @returns {void}
     */
    startLogicLoop() { this.clearMovementInterval(); this.movementInterval = setInterval(() => { this.updateLogic(); }, 1000 / 60); }

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

    shouldSkipTick() {
        if (!this.boss.isHurting && !this.boss.isDeadState) return false;
        this.helpers.cancelJump();
        return true;
    }

    updateFacingDirection() {
        if (!this.canUpdateFacing()) return;
        const direction = this.helpers.getDirectionToCharacter();
        this.boss.otherDirection = direction > 0;
    }

    canUpdateFacing() {
        if (!this.getChar()) return false;
        return !this.helpers.isActionActive()
            && !this.boss.isAlerting
            && !this.boss.isAttacking
            && !this.boss.isHurting;
    }

    applyContactDamage() {
        if (!this.isOverlapping()) return;
        this.applyBossDamage(this.boss.contactDamageAmount);
    }

    isOverlapping() {
        const character = this.getChar();
        if (!character) return false;
        return character.isColliding(this.boss);
    }

    getChar() { return this.boss.world?.character; }
    isCharAlive(character) { return character && !character.isDead?.(); }
    nowMs() { return Date.now(); }
    centerX(target) { return target.x + target.width / 2; }
    distX(a, b) { return Math.abs(this.centerX(a) - this.centerX(b)); }
    ensureDormantVisual() { if (this.didSetDormantVisual) return; this.didSetDormantVisual = true; this.boss.enterDormantMode(); }

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

    isBossBusy() {
        return this.boss.isHurting
            || this.boss.isDeadState
            || this.boss.isAttacking
            || this.boss.isAlerting
            || this.helpers.isActionActive();
    }

    tryAttackOrAlert() {
        const distanceAhead = this.getDistanceAhead();
        return this.boss.handleAttackOrAlert(distanceAhead, !this.hasDoneFirstSightAlert);
    }

    getDistanceAhead() {
        const character = this.getChar();
        if (!character) return Infinity;
        return this.boss.x - (character.x + character.width);
    }

    onHurtEnd() {
        if (this.isDormant || this.inWake()) { this.boss.enterDormantMode(); return; }
        if (this.boss.isDeadState || this.helpers.isActionActive()) return;
        if (this.helpers.isMidRange()) this.helpers.startSprintTelegraph();
    }

    tryAttackDamage() {
        if (!this.isOverlapping()) return false;
        return this.applyBossDamage(this.boss.contactDamageAmount);
    }

    applyBossDamage(amount = this.boss.contactDamageAmount) {
        if (!this.canDealDamage()) return false;
        this.commitDamage(amount);
        return true;
    }

    commitDamage(amount) {
        const character = this.getChar();
        if (!character) return;
        character.takeDamage(amount);
        this.lastDamageTime = this.nowMs();
        this.updatePlayerHud(character);
    }

    canDealDamage() {
        return this.nowMs() - this.lastDamageTime >= 900;
    }
    
    updatePlayerHud(character) {
        const percentage = (character.energy / 600) * 100;
        this.boss.world?.statusBar?.setPercentage(percentage);
    }
}
