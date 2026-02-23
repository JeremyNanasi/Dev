/**
 * Helper operations for endboss movement actions, jumps, and phases.
 */
class EndbossLogicHelpers {
    /**
     * @param {EndbossLogic} logic
     */
    constructor(logic) {
        this.logic = logic;
    }
    /** Checks `shouldStartJump`. @returns {*} Result. */
    shouldStartJump() {
        const logic = this.logic;
        const character = logic.getChar();
        if (!character || character.isDead?.()) return false;
        if (logic.isBossBusy() || logic.jump.active) return false;
        if (this.getDistanceToCharacter() < 400) return false;
        return logic.nowMs() - logic.lastJumpTime >= 2500;
    }

    /**
     * Attempts to start a targeted jump attack.
     * @returns {boolean}
     */
    tryTargetedJump() {
        if (!this.shouldStartJump()) return false;
        this.startJump();
        return true;
    }
    /** Runs `startJump`. @returns {*} Result. */
    startJump() {
        const logic = this.logic;
        const character = logic.getChar();
        if (!character) return;
        const now = logic.nowMs();
        logic.lastJumpTime = now;
        logic.jump = { active: true, startTime: now, baseX: logic.boss.x, baseY: logic.boss.y, targetX: logic.centerX(character), height: 260, duration: 900, impactDone: false };
        logic.boss.stopWalkingAnimation();
    }
    /** Updates `updateJump` state. @returns {*} Result. */
    updateJump() {
        const logic = this.logic;
        if (!logic.jump.active) return false;
        const t = Math.min(1, (logic.nowMs() - logic.jump.startTime) / logic.jump.duration);
        this.updateJumpPosition(t);
        if (this.isLandingTick(t)) this.applyLandingDamage();
        if (t >= 1) this.finishJump();
        return true;
    }

    updateJumpPosition(t) { this.updateJumpX(t); this.updateJumpY(t); }
    /** Updates `updateJumpX` state. @param {*} t - Value. */
    updateJumpX(t) {
        const logic = this.logic;
        const landingX = logic.jump.targetX - logic.boss.width / 2;
        logic.boss.x = logic.jump.baseX + (landingX - logic.jump.baseX) * t;
        this.clampToBounds();
    }
    /** Updates `updateJumpY` state. @param {*} t - Value. */
    updateJumpY(t) {
        const logic = this.logic;
        const height = logic.jump.height;
        logic.boss.y = logic.jump.baseY - 4 * height * t * (1 - t);
        if (t >= 1) logic.boss.y = logic.jump.baseY;
    }
    /** Checks `isLandingTick`. @param {*} t - Value. @returns {*} Result. */
    isLandingTick(t) {
        const logic = this.logic;
        if (logic.jump.impactDone) return false;
        if (t < 1) return false;
        logic.jump.impactDone = true;
        return true;
    }
    /** Runs `applyLandingDamage`. @returns {*} Result. */
    applyLandingDamage() {
        const logic = this.logic;
        const character = logic.getChar();
        if (!character || character.isAboveGround()) return;
        if (this.directHit(character)) {
            logic.applyBossDamage(300);
            return;
        }
        if (this.inShockwaveRange(character)) logic.applyBossDamage(100);
    }
    /** Runs `directHit`. @param {*} character - Value. @returns {*} Result. */
    directHit(character) {
        return character.isColliding(this.logic.boss);
    }
    /** Runs `inShockwaveRange`. @param {*} character - Value. @returns {*} Result. */
    inShockwaveRange(character) {
        const logic = this.logic;
        return Math.abs(logic.centerX(character) - logic.centerX(logic.boss)) <= 520;
    }

    finishJump() { this.logic.jump = this.logic.createJumpState(); }
    /** Checks `cancelJump`. @returns {*} Result. */
    cancelJump() {
        const logic = this.logic;
        if (!logic.jump.active) return;
        logic.boss.y = logic.jump.baseY;
        logic.jump = logic.createJumpState();
    }
    /** Checks `isMidRange`. @returns {*} Result. */
    isMidRange() {
        const distance = this.getDistanceToCharacter();
        return distance >= 250 && distance <= 650;
    }
    /** Runs `trySprint`. @returns {*} Result. */
    trySprint() {
        if (!this.canStartSprint()) return false;
        this.startSprintTelegraph();
        return true;
    }
    /** Checks `canStartSprint`. @returns {*} Result. */
    canStartSprint() {
        const boss = this.logic.boss;
        if (!this.isMidRange()) return false;
        if (boss.isAttacking || boss.isAlerting || boss.isHurting) return false;
        return true;
    }
    /** Runs `startSprintTelegraph`. */
    startSprintTelegraph() {
        const logic = this.logic;
        logic.boss.stopWalkingAnimation();
        logic.boss.setAlertFrame();
        this.startAction('telegraph', 300, this.getDirectionToCharacter(), 1, 0);
    }
    /** Runs `startSprint`. @param {*} direction - Value. */
    startSprint(direction) {
        const logic = this.logic;
        const multiplier = this.getSprintMultiplier();
        logic.boss.stopAlertLoopIfAny();
        logic.boss.startWalkingAnimation();
        this.startAction('sprint', 600, direction, multiplier, 0);
    }

    getSprintMultiplier() { const phase = this.getPhase(); return phase === 3 ? 3.8 : phase === 2 ? 3.4 : 3.0; }
    /** Runs `tryJumpSlam`. @returns {*} Result. */
    tryJumpSlam() {
        if (!this.canStartJumpSlam()) return false;
        this.startJumpSlam();
        return true;
    }
    /** Checks `canStartJumpSlam`. @returns {*} Result. */
    canStartJumpSlam() {
        const logic = this.logic;
        if (this.getPhase() < 2) return false;
        if (this.getDistanceToCharacter() > 650) return false;
        const cooldown = this.getSlamCooldown();
        return Date.now() - logic.lastSlamTime >= cooldown;
    }
    /** Runs `startJumpSlam`. */
    startJumpSlam() {
        const logic = this.logic;
        logic.lastSlamTime = Date.now();
        logic.boss.stopWalkingAnimation();
        this.startAction('slam', 700, this.getDirectionToCharacter(), 1.5, 80);
    }
    /** Gets `getSlamCooldown` data. @returns {*} Result. */
    getSlamCooldown() {
        return this.getPhase() === 3 ? 1800 : 2400;
    }

    /**
     * Updates and steps the currently active action state.
     * @returns {boolean}
     */
    updateAction() {
        const logic = this.logic;
        if (!this.isActionActive()) return false;
        if (Date.now() >= logic.action.endTime) {
            this.finishAction();
            return true;
        }
        this.stepAction();
        return true;
    }
    /** Checks `isActionActive`. @returns {*} Result. */
    isActionActive() {
        return Boolean(this.logic.action.type);
    }
    /** Runs `stepAction`. @returns {*} Result. */
    stepAction() {
        const type = this.logic.action.type;
        if (type === 'sprint') return this.stepSprint();
        if (type === 'slam') return this.stepSlam();
        if (type === 'telegraph') return this.stepTelegraph();
        return null;
    }
    /** Runs `stepTelegraph`. @returns {*} Result. */
    stepTelegraph() {
        return null;
    }
    /** Runs `stepSprint`. */
    stepSprint() {
        this.stepMove(this.logic.action.direction, this.logic.action.speed);
    }
    /** Runs `stepSlam`. */
    stepSlam() {
        this.stepMove(this.logic.action.direction, this.logic.action.speed);
        this.updateHopY(this.logic.action.height);
    }
    /** Runs `stepMove`. @param {*} direction - Value. @param {*} multiplier - Value. */
    stepMove(direction, multiplier) {
        const logic = this.logic;
        const speed = logic.boss.speed * multiplier;
        if (direction < 0) {
            logic.boss.x -= speed;
        } else {
            logic.boss.x += speed;
        }
        this.clampToBounds();
    }
    /** Runs `clampToBounds`. */
    clampToBounds() {
        const logic = this.logic;
        const minX = logic.boss.getMinX();
        const maxX = logic.boss.getMaxX();
        if (logic.boss.x < minX) logic.boss.x = minX;
        if (logic.boss.x > maxX) logic.boss.x = maxX;
    }
    /** Updates `updateHopY` state. @param {*} height - Value. */
    updateHopY(height) {
        const logic = this.logic;
        const progress = this.getActionProgress();
        logic.boss.y = logic.action.baseY - height * Math.sin(Math.PI * progress);
    }

    getActionProgress() { const logic = this.logic; const elapsed = Date.now() - logic.action.startTime; const duration = logic.action.endTime - logic.action.startTime; return Math.min(1, elapsed / Math.max(1, duration)); }
    /** Runs `finishAction`. */
    finishAction() {
        const logic = this.logic;
        const type = logic.action.type;
        const baseY = logic.action.baseY;
        const direction = logic.action.direction;
        this.resetAction(baseY);
        if (type === 'telegraph') this.startSprint(direction);
        if (type === 'slam') this.handleSlamLanding();
    }
    /** Runs `resetAction`. @param {*} baseY - Value. */
    resetAction(baseY) {
        const logic = this.logic;
        logic.action = logic.createActionState(baseY);
        logic.boss.y = baseY;
    }
    /** Runs `startAction`. @param {*} type - Value. @param {*} duration - Value. @param {*} direction - Value. @param {*} speed - Value. @param {*} height - Value. */
    startAction(type, duration, direction, speed, height) {
        const logic = this.logic;
        const now = Date.now();
        logic.action = { type, endTime: now + duration, direction, speed, startTime: now, baseY: logic.boss.y, height: height || 0 };
    }
    /** Handles `handleSlamLanding`. @returns {*} Result. */
    handleSlamLanding() {
        if (!this.isPlayerGrounded()) return;
        if (this.getDistanceToCharacter() > 180) return;
        this.logic.applyBossDamage();
    }
    /** Checks `isPlayerGrounded`. @returns {*} Result. */
    isPlayerGrounded() {
        const character = this.logic.getChar();
        return character && !character.isAboveGround();
    }
    /** Gets `getPhase` data. @returns {*} Result. */
    getPhase() {
        const energy = this.logic.boss.energy;
        if (energy <= 18) return 3;
        if (energy <= 35) return 2;
        return 1;
    }
    /** Handles `handleMovement`. @returns {*} Result. */
    handleMovement() {
        const logic = this.logic;
        if (this.isCharacterDead()) return this.handleDeadMovement();
        const direction = this.getMovementDirection();
        if (direction === 0 || !this.canMoveDirection(direction)) {
            logic.boss.stopWalkingAnimation();
            return;
        }
        logic.boss.stopAlertLoopIfAny();
        logic.boss.startWalkingAnimation();
        this.moveDirection(direction);
    }
    /** Handles `handleDeadMovement`. */
    handleDeadMovement() {
        const logic = this.logic;
        if (this.canMoveLeft()) {
            logic.boss.otherDirection = false;
            logic.boss.startWalkingAnimation();
            logic.boss.moveLeft();
            return;
        }
        logic.boss.stopWalkingAnimation();
    }
    /** Checks `isCharacterDead`. @returns {*} Result. */
    isCharacterDead() {
        return this.logic.getChar()?.isDead?.();
    }
    /** Gets `getMovementDirection` data. @returns {*} Result. */
    getMovementDirection() {
        const logic = this.logic;
        const character = logic.getChar();
        if (!character) return 0;
        if (this.isNormalBlocked()) return 0;
        const distance = this.getDistanceToCharacter();
        if (distance > logic.boss.startMovingDistance) return 0;
        if (distance < 50) return 0;
        return this.getDirectionToCharacter();
    }
    /** Checks `isNormalBlocked`. @returns {*} Result. */
    isNormalBlocked() {
        const boss = this.logic.boss;
        return boss.isAlerting || boss.isAttacking || boss.isHurting;
    }

    canMoveDirection(direction) { return direction < 0 ? this.canMoveLeft() : this.canMoveRight(); }
    /** Checks `canMoveLeft`. @returns {*} Result. */
    canMoveLeft() {
        return this.logic.boss.x > this.logic.boss.getMinX();
    }
    /** Checks `canMoveRight`. @returns {*} Result. */
    canMoveRight() {
        return this.logic.boss.x < this.logic.boss.getMaxX();
    }
    /** Runs `moveDirection`. @param {*} direction - Value. */
    moveDirection(direction) {
        const boss = this.logic.boss;
        if (direction < 0) {
            boss.otherDirection = false;
            boss.moveLeft();
            return;
        }
        boss.otherDirection = true;
        boss.moveRight();
    }
    /** Gets `getDirectionToCharacter` data. @returns {*} Result. */
    getDirectionToCharacter() {
        const logic = this.logic;
        const character = logic.getChar();
        const endbossCenter = logic.boss.x + logic.boss.width / 2;
        const characterCenter = character.x + character.width / 2;
        return characterCenter < endbossCenter ? -1 : 1;
    }
    /** Gets `getDistanceToCharacter` data. @returns {*} Result. */
    getDistanceToCharacter() {
        const logic = this.logic;
        const character = logic.getChar();
        if (!character) return Infinity;
        return logic.distX(logic.boss, character);
    }
}
