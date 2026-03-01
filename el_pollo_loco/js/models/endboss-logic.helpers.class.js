/** Defines `EndbossLogicHelpers`, a helper layer for endboss actions (movement, jumps, phases) used by `EndbossLogic`. */
class EndbossLogicHelpers {
    /** Initializes a new methods instance and sets up default runtime state. The constructor prepares dependencies used by class behavior. */
    constructor(logic) {
        this.logic = logic;
    }

    /** Evaluates the start jump condition. Returns whether the current runtime state satisfies that condition. */
    shouldStartJump() {
        const logic = this.logic;
        const character = logic.getChar();
        if (!character || character.isDead?.()) return false;
        if (logic.isBossBusy() || logic.jump.active) return false;
        if (this.getDistanceToCharacter() < 400) return false;
        return logic.nowMs() - logic.lastJumpTime >= 2500;
    }

    /** Executes the try targeted jump routine. The logic is centralized here for maintainability. */
    tryTargetedJump() {
        if (!this.shouldStartJump()) return false;
        this.startJump();
        return true;
    }

    /** Starts jump. The operation is isolated here to keep behavior predictable. */
    startJump() {
        const logic = this.logic;
        const character = logic.getChar();
        if (!character) return;
        const now = logic.nowMs();
        logic.lastJumpTime = now;
        logic.jump = { active: true, startTime: now, baseX: logic.boss.x, baseY: logic.boss.y, targetX: logic.centerX(character), height: 260, duration: 900, impactDone: false };
        logic.boss.stopWalkingAnimation();
    }

    /** Updates jump. This synchronizes runtime state with current inputs. */
    updateJump() {
        const logic = this.logic;
        if (!logic.jump.active) return false;
        const t = Math.min(1, (logic.nowMs() - logic.jump.startTime) / logic.jump.duration);
        this.updateJumpPosition(t);
        if (this.isLandingTick(t)) this.applyLandingDamage();
        if (t >= 1) this.finishJump();
        return true;
    }

    /**
     * Updates jump position for the current normalized jump progress.
     * @param {number} t - Normalized jump progress in the range from 0 to 1.
     */
    updateJumpPosition(t) { this.updateJumpX(t); this.updateJumpY(t); }

    /** Updates jump x. This synchronizes runtime state with current inputs. */
    updateJumpX(t) {
        const logic = this.logic;
        const landingX = logic.jump.targetX - logic.boss.width / 2;
        logic.boss.x = logic.jump.baseX + (landingX - logic.jump.baseX) * t;
        this.clampToBounds();
    }

    /** Updates jump y. This synchronizes runtime state with current inputs. */
    updateJumpY(t) {
        const logic = this.logic;
        const height = logic.jump.height;
        logic.boss.y = logic.jump.baseY - 4 * height * t * (1 - t);
        if (t >= 1) logic.boss.y = logic.jump.baseY;
    }

    /** Evaluates the landing tick condition. Returns whether the current runtime state satisfies that condition. */
    isLandingTick(t) {
        const logic = this.logic;
        if (logic.jump.impactDone) return false;
        if (t < 1) return false;
        logic.jump.impactDone = true;
        return true;
    }

    /** Applies landing damage. The operation is isolated here to keep behavior predictable. */
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

    /** Executes the direct hit routine. The logic is centralized here for maintainability. */
    directHit(character) {
        return character.isColliding(this.logic.boss);
    }

    /** Executes the in shockwave range routine. The logic is centralized here for maintainability. */
    inShockwaveRange(character) {
        const logic = this.logic;
        return Math.abs(logic.centerX(character) - logic.centerX(logic.boss)) <= 520;
    }

    /**
     * Resets jump state after landing so the next jump can start cleanly.
     */
    finishJump() { this.logic.jump = this.logic.createJumpState(); }

    /** Executes the cancel jump routine. The logic is centralized here for maintainability. */
    cancelJump() {
        const logic = this.logic;
        if (!logic.jump.active) return;
        logic.boss.y = logic.jump.baseY;
        logic.jump = logic.createJumpState();
    }

    /** Evaluates the mid range condition. Returns whether the current runtime state satisfies that condition. */
    isMidRange() {
        const distance = this.getDistanceToCharacter();
        return distance >= 250 && distance <= 650;
    }

    /** Executes the try sprint routine. The logic is centralized here for maintainability. */
    trySprint() {
        if (!this.canStartSprint()) return false;
        this.startSprintTelegraph();
        return true;
    }

    /** Evaluates the start sprint condition. Returns whether the current runtime state satisfies that condition. */
    canStartSprint() {
        const boss = this.logic.boss;
        if (!this.isMidRange()) return false;
        if (boss.isAttacking || boss.isAlerting || boss.isHurting) return false;
        return true;
    }

    /** Starts sprint telegraph. The operation is isolated here to keep behavior predictable. */
    startSprintTelegraph() {
        const logic = this.logic;
        logic.boss.stopWalkingAnimation();
        logic.boss.setAlertFrame();
        this.startAction('telegraph', 300, this.getDirectionToCharacter(), 1, 0);
    }

    /** Starts sprint. The operation is isolated here to keep behavior predictable. */
    startSprint(direction) {
        const logic = this.logic;
        const multiplier = this.getSprintMultiplier();
        logic.boss.stopAlertLoopIfAny();
        logic.boss.startWalkingAnimation();
        this.startAction('sprint', 600, direction, multiplier, 0);
    }

    /**
     * Returns the sprint speed multiplier for the current boss phase.
     * @returns {number} Sprint speed multiplier for movement updates.
     */
    getSprintMultiplier() { const phase = this.getPhase(); return phase === 3 ? 3.8 : phase === 2 ? 3.4 : 3.0; }
    /** Executes the try jump slam routine. The logic is centralized here for maintainability. */
    tryJumpSlam() {
        if (!this.canStartJumpSlam()) return false;
        this.startJumpSlam();
        return true;
    }

    /** Evaluates the start jump slam condition. Returns whether the current runtime state satisfies that condition. */
    canStartJumpSlam() {
        const logic = this.logic;
        if (this.getPhase() < 2) return false;
        if (this.getDistanceToCharacter() > 650) return false;
        const cooldown = this.getSlamCooldown();
        return Date.now() - logic.lastSlamTime >= cooldown;
    }

    /** Starts jump slam. The operation is isolated here to keep behavior predictable. */
    startJumpSlam() {
        const logic = this.logic;
        logic.lastSlamTime = Date.now();
        logic.boss.stopWalkingAnimation();
        this.startAction('slam', 700, this.getDirectionToCharacter(), 1.5, 80);
    }

    /** Returns the slam cooldown. This helper centralizes read access for callers. */
    getSlamCooldown() {
        return this.getPhase() === 3 ? 1800 : 2400;
    }

    /** Updates action. This synchronizes runtime state with current inputs. */
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

    /** Evaluates the action active condition. Returns whether the current runtime state satisfies that condition. */
    isActionActive() {
        return Boolean(this.logic.action.type);
    }

    /** Executes the step action routine. The logic is centralized here for maintainability. */
    stepAction() {
        const type = this.logic.action.type;
        if (type === 'sprint') return this.stepSprint();
        if (type === 'slam') return this.stepSlam();
        if (type === 'telegraph') return this.stepTelegraph();
        return null;
    }

    /** Executes the step telegraph routine. The logic is centralized here for maintainability. */
    stepTelegraph() {
        return null;
    }

    /** Executes the step sprint routine. The logic is centralized here for maintainability. */
    stepSprint() {
        this.stepMove(this.logic.action.direction, this.logic.action.speed);
    }

    /** Executes the step slam routine. The logic is centralized here for maintainability. */
    stepSlam() {
        this.stepMove(this.logic.action.direction, this.logic.action.speed);
        this.updateHopY(this.logic.action.height);
    }

    /** Executes the step move routine. The logic is centralized here for maintainability. */
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

    /** Executes the clamp to bounds routine. The logic is centralized here for maintainability. */
    clampToBounds() {
        const logic = this.logic;
        const minX = logic.boss.getMinX();
        const maxX = logic.boss.getMaxX();
        if (logic.boss.x < minX) logic.boss.x = minX;
        if (logic.boss.x > maxX) logic.boss.x = maxX;
    }

    /** Updates hop y. This synchronizes runtime state with current inputs. */
    updateHopY(height) {
        const logic = this.logic;
        const progress = this.getActionProgress();
        logic.boss.y = logic.action.baseY - height * Math.sin(Math.PI * progress);
    }
    /**
     * Returns normalized progress for the active timed action.
     * @returns {number} Progress clamped between 0 and 1.
     */
    getActionProgress() { const logic = this.logic; const elapsed = Date.now() - logic.action.startTime; const duration = logic.action.endTime - logic.action.startTime; return Math.min(1, elapsed / Math.max(1, duration)); }
    /** Executes the finish action routine. The logic is centralized here for maintainability. */
    finishAction() {
        const logic = this.logic;
        const type = logic.action.type;
        const baseY = logic.action.baseY;
        const direction = logic.action.direction;
        this.resetAction(baseY);
        if (type === 'telegraph') this.startSprint(direction);
        if (type === 'slam') this.handleSlamLanding();
    }

    /** Resets action. The operation is isolated here to keep behavior predictable. */
    resetAction(baseY) {
        const logic = this.logic;
        logic.action = logic.createActionState(baseY);
        logic.boss.y = baseY;
    }

    /** Starts action. The operation is isolated here to keep behavior predictable. */
    startAction(type, duration, direction, speed, height) {
        const logic = this.logic;
        const now = Date.now();
        logic.action = { type, endTime: now + duration, direction, speed, startTime: now, baseY: logic.boss.y, height: height || 0 };
    }

    /** Handles slam landing. It applies side effects required by this branch. */
    handleSlamLanding() {
        if (!this.isPlayerGrounded()) return;
        if (this.getDistanceToCharacter() > 180) return;
        this.logic.applyBossDamage();
    }

    /** Evaluates the player grounded condition. Returns whether the current runtime state satisfies that condition. */
    isPlayerGrounded() {
        const character = this.logic.getChar();
        return character && !character.isAboveGround();
    }

    /** Returns the phase. This helper centralizes read access for callers. */
    getPhase() {
        const energy = this.logic.boss.energy;
        if (energy <= 18) return 3;
        if (energy <= 35) return 2;
        return 1;
    }

    /** Handles movement. It applies side effects required by this branch. */
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

    /** Handles dead movement. It applies side effects required by this branch. */
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

    /** Evaluates the character dead condition. Returns whether the current runtime state satisfies that condition. */
    isCharacterDead() {
        return this.logic.getChar()?.isDead?.();
    }

    /** Returns the movement direction. This helper centralizes read access for callers. */
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

    /** Evaluates the normal blocked condition. Returns whether the current runtime state satisfies that condition. */
    isNormalBlocked() {
        const boss = this.logic.boss;
        return boss.isAlerting || boss.isAttacking || boss.isHurting;
    }

    /**
     * Checks whether the boss can move in the requested horizontal direction.
     * @param {number} direction - Horizontal direction where negative is left and positive is right.
     * @returns {boolean} True when movement in that direction stays within bounds.
     */
    canMoveDirection(direction) { return direction < 0 ? this.canMoveLeft() : this.canMoveRight(); }
    
    /** Evaluates the move left condition. Returns whether the current runtime state satisfies that condition. */
    canMoveLeft() {
        return this.logic.boss.x > this.logic.boss.getMinX();
    }

    /** Evaluates the move right condition. Returns whether the current runtime state satisfies that condition. */
    canMoveRight() {
        return this.logic.boss.x < this.logic.boss.getMaxX();
    }

    /** Executes the move direction routine. The logic is centralized here for maintainability. */
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

    /** Returns the direction to character. This helper centralizes read access for callers. */
    getDirectionToCharacter() {
        const logic = this.logic;
        const character = logic.getChar();
        const endbossCenter = logic.boss.x + logic.boss.width / 2;
        const characterCenter = character.x + character.width / 2;
        return characterCenter < endbossCenter ? -1 : 1;
    }

    /** Returns the distance to character. This helper centralizes read access for callers. */
    getDistanceToCharacter() {
        const logic = this.logic;
        const character = logic.getChar();
        if (!character) return Infinity;
        return logic.distX(logic.boss, character);
    }
}