/**
 * @fileoverview
 * Implements the endboss AI controller: activation gating, wake window handling,
 * aggressive decision loop, and contact damage application against the character.
 */

/**
 * @typedef {Object} EndbossActionState
 * @property {string|null} type - Current action identifier or null when idle.
 * @property {number} endTime - Timestamp in ms when the current action ends.
 * @property {number} direction - Movement direction used by the action (-1/0/1).
 * @property {number} speed - Movement speed multiplier for the action.
 * @property {number} startTime - Timestamp in ms when the action started.
 * @property {number} baseY - Baseline Y reference used for vertical actions.
 * @property {number} height - Action height used for jump/telegraph animations.
 */

/**
 * @typedef {Object} EndbossJumpState
 * @property {boolean} active - Whether a jump action is currently active.
 * @property {number} startTime - Timestamp in ms when the jump started.
 * @property {number} baseX - X position when the jump started.
 * @property {number} baseY - Y position when the jump started.
 * @property {number} targetX - Intended landing X position.
 * @property {number} height - Jump height in pixels.
 * @property {number} duration - Jump duration in ms.
 * @property {boolean} impactDone - Whether landing impact logic has been applied.
 */

/**
 * Coordinates endboss AI state, activation, and damage application.
 */
class EndbossLogic {
    /**
     * Initializes a new methods instance and sets up default runtime state.
     * The constructor prepares dependencies used by class behavior.
     * @param {object} boss - Object argument used by this routine.
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

    /**
     * Creates the initial action state object used by the helper layer.
     * @param {number} baseY - Baseline Y coordinate used as vertical reference.
     * @returns {EndbossActionState} The initialized action state container.
     */
    createActionState(baseY) { return { type: null, endTime: 0, direction: 0, speed: 1, startTime: 0, baseY, height: 0 }; }
    
    /**
     * Creates jump state.
     * The result is consumed by downstream game logic.
     * @returns {object} Returns an object containing computed state values.
     */
    createJumpState() {
        return { active: false, startTime: 0, baseX: 0, baseY: 0, targetX: 0, height: 260, duration: 900, impactDone: false };
    }

    /**
     * Starts the main endboss logic loop at roughly 60 FPS.
     * @returns {void}
     */
    startLogicLoop() { this.clearMovementInterval(); this.movementInterval = setInterval(() => { this.updateLogic(); }, 1000 / 60); }
    
    /**
     * Executes the clear movement interval routine.
     * The logic is centralized here for maintainability.
     */
    clearMovementInterval() {
        if (!this.movementInterval) return;
        clearInterval(this.movementInterval);
        this.movementInterval = null;
    }

    /**
     * Updates logic.
     * This synchronizes runtime state with current inputs.
     * @returns {unknown} Returns the value produced by this routine.
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

    /**
     * Executes the run aggressive routine.
     * The logic is centralized here for maintainability.
     */
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

    /**
     * Evaluates the skip tick condition.
     * Returns whether the current runtime state satisfies that condition.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    shouldSkipTick() {
        if (!this.boss.isHurting && !this.boss.isDeadState) return false;
        this.helpers.cancelJump();
        return true;
    }

    /**
     * Updates facing direction.
     * This synchronizes runtime state with current inputs.
     */
    updateFacingDirection() {
        if (!this.canUpdateFacing()) return;
        const direction = this.helpers.getDirectionToCharacter();
        this.boss.otherDirection = direction > 0;
    }

    /**
     * Evaluates the update facing condition.
     * Returns whether the current runtime state satisfies that condition.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    canUpdateFacing() {
        if (!this.getChar()) return false;
        return !this.helpers.isActionActive()
            && !this.boss.isAlerting
            && !this.boss.isAttacking
            && !this.boss.isHurting;
    }

    /**
     * Applies contact damage.
     * The operation is isolated here to keep behavior predictable.
     */
    applyContactDamage() {
        if (!this.isOverlapping()) return;
        this.applyBossDamage(this.boss.contactDamageAmount);
    }

    /**
     * Evaluates the overlapping condition.
     * Returns whether the current runtime state satisfies that condition.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isOverlapping() {
        const character = this.getChar();
        if (!character) return false;
        const collision = this.boss.world?.collision;
        if (!collision?.isContactDamageHit) return character.isColliding(this.boss);
        return collision.isContactDamageHit(character, this.boss, collision.getContactTuning());
    }

    /**
     * Returns the current character instance from the world (if available).
     * @returns {Character|undefined} The active character or undefined when not available.
     */
    getChar() { return this.boss.world?.character; }

    /**
     * Checks whether the character is alive (not missing and not in a dead state).
     * @param {Character|undefined|null} character - The character instance to check.
     * @returns {boolean} True if the character is alive; otherwise false.
     */
    isCharAlive(character) { return character && !character.isDead?.(); }

    /**
     * Returns the current time in milliseconds.
     * @returns {number} Current time in ms.
     */
    nowMs() { return Date.now(); }

    /**
     * Calculates the horizontal center X coordinate of a movable object.
     * @param {MoveableObject} target - The object to measure.
     * @returns {number} The horizontal center coordinate.
     */
    centerX(target) { return target.x + target.width / 2; }

    /**
     * Calculates the absolute horizontal distance between two objects using their center X positions.
     * @param {MoveableObject} a - First object.
     * @param {MoveableObject} b - Second object.
     * @returns {number} The absolute center-to-center distance.
     */
    distX(a, b) { return Math.abs(this.centerX(a) - this.centerX(b)); }

    /**
     * Ensures dormant visuals are applied exactly once while the endboss is dormant.
     * @returns {void}
     */
    ensureDormantVisual() { if (this.didSetDormantVisual) return; this.didSetDormantVisual = true; this.boss.enterDormantMode(); }
    
    /**
     * Executes the try activate routine.
     * The logic is centralized here for maintainability.
     * @param {Character} character - Character instance involved in this operation.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
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

    /**
     * Checks whether the endboss is currently in the wake/alert window after activation.
     * @returns {boolean} True while the wake window is active; otherwise false.
     */
    inWake() { return this.nowMs() < this.wakeEndsAt; }

    /**
     * Evaluates the boss busy condition.
     * Returns whether the current runtime state satisfies that condition.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isBossBusy() {
        return this.boss.isHurting
            || this.boss.isDeadState
            || this.boss.isAttacking
            || this.boss.isAlerting
            || this.helpers.isActionActive();
    }

    /**
     * Executes the try attack or alert routine.
     * The logic is centralized here for maintainability.
     * @returns {unknown} Returns the value produced by this routine.
     */
    tryAttackOrAlert() {
        const distanceAhead = this.getDistanceAhead();
        return this.boss.handleAttackOrAlert(distanceAhead, !this.hasDoneFirstSightAlert);
    }

    /**
     * Returns the distance ahead.
     * This helper centralizes read access for callers.
     * @returns {number} Returns the computed numeric value.
     */
    getDistanceAhead() {
        const character = this.getChar();
        if (!character) return Infinity;
        return this.boss.x - (character.x + character.width);
    }

    /**
     * Handles hurt end.
     * It applies side effects required by this branch.
     */
    onHurtEnd() {
        if (this.isDormant || this.inWake()) { this.boss.enterDormantMode(); return; }
        if (this.boss.isDeadState || this.helpers.isActionActive()) return;
        if (this.helpers.isMidRange()) this.helpers.startSprintTelegraph();
    }

    /**
     * Executes the try attack damage routine.
     * The logic is centralized here for maintainability.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    tryAttackDamage() {
        if (!this.isOverlapping()) return false;
        return this.applyBossDamage(this.boss.contactDamageAmount);
    }

    /**
     * Applies boss damage.
     * The operation is isolated here to keep behavior predictable.
     * @param {unknown} amount - Input value used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    applyBossDamage(amount = this.boss.contactDamageAmount) {
        if (!this.canDealDamage()) return false;
        this.commitDamage(amount);
        return true;
    }

    /**
     * Executes the commit damage routine.
     * The logic is centralized here for maintainability.
     * @param {unknown} amount - Input value used by this routine.
     */
    commitDamage(amount) {
        const character = this.getChar();
        if (!character) return;
        character.takeDamage(amount);
        this.lastDamageTime = this.nowMs();
        this.updatePlayerHud(character);
    }

    /**
     * Evaluates the deal damage condition.
     * Returns whether the current runtime state satisfies that condition.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    canDealDamage() {
        return this.nowMs() - this.lastDamageTime >= 900;
    }

    /**
     * Updates player hud.
     * This synchronizes runtime state with current inputs.
     * @param {Character} character - Character instance involved in this operation.
     */
    updatePlayerHud(character) {
        const percentage = (character.energy / 600) * 100;
        this.boss.world?.statusBar?.setPercentage(percentage);
    }
}