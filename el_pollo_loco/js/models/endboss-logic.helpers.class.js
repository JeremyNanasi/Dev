class EndbossLogicHelpers {
    constructor(logic) {
        this.logic = logic;
    }

    shouldStartJump() {
        const logic = this.logic;
        const character = logic.getChar();
        if (!character || character.isDead?.()) return false;
        if (logic.isBossBusy() || logic.jump.active) return false;
        if (this.getDistanceToCharacter() < 400) return false;
        return logic.nowMs() - logic.lastJumpTime >= 2500;
    }

    tryTargetedJump() {
        if (!this.shouldStartJump()) return false;
        this.startJump();
        return true;
    }

    startJump() {
        const logic = this.logic;
        const character = logic.getChar();
        if (!character) return;
        const now = logic.nowMs();
        logic.lastJumpTime = now;
        logic.jump = { active: true, startTime: now, baseX: logic.boss.x, baseY: logic.boss.y, targetX: logic.centerX(character), height: 260, duration: 900, impactDone: false };
        logic.boss.stopWalkingAnimation();
    }

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

    updateJumpX(t) {
        const logic = this.logic;
        const landingX = logic.jump.targetX - logic.boss.width / 2;
        logic.boss.x = logic.jump.baseX + (landingX - logic.jump.baseX) * t;
        this.clampToBounds();
    }

    updateJumpY(t) {
        const logic = this.logic;
        const height = logic.jump.height;
        logic.boss.y = logic.jump.baseY - 4 * height * t * (1 - t);
        if (t >= 1) logic.boss.y = logic.jump.baseY;
    }

    isLandingTick(t) {
        const logic = this.logic;
        if (logic.jump.impactDone) return false;
        if (t < 1) return false;
        logic.jump.impactDone = true;
        return true;
    }

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

    directHit(character) {
        return character.isColliding(this.logic.boss);
    }

    inShockwaveRange(character) {
        const logic = this.logic;
        return Math.abs(logic.centerX(character) - logic.centerX(logic.boss)) <= 520;
    }

    finishJump() { this.logic.jump = this.logic.createJumpState(); }

    cancelJump() {
        const logic = this.logic;
        if (!logic.jump.active) return;
        logic.boss.y = logic.jump.baseY;
        logic.jump = logic.createJumpState();
    }

    isMidRange() {
        const distance = this.getDistanceToCharacter();
        return distance >= 250 && distance <= 650;
    }

    trySprint() {
        if (!this.canStartSprint()) return false;
        this.startSprintTelegraph();
        return true;
    }

    canStartSprint() {
        const boss = this.logic.boss;
        if (!this.isMidRange()) return false;
        if (boss.isAttacking || boss.isAlerting || boss.isHurting) return false;
        return true;
    }

    startSprintTelegraph() {
        const logic = this.logic;
        logic.boss.stopWalkingAnimation();
        logic.boss.setAlertFrame();
        this.startAction('telegraph', 300, this.getDirectionToCharacter(), 1, 0);
    }

    startSprint(direction) {
        const logic = this.logic;
        const multiplier = this.getSprintMultiplier();
        logic.boss.stopAlertLoopIfAny();
        logic.boss.startWalkingAnimation();
        this.startAction('sprint', 600, direction, multiplier, 0);
    }

    getSprintMultiplier() { const phase = this.getPhase(); return phase === 3 ? 3.8 : phase === 2 ? 3.4 : 3.0; }

    tryJumpSlam() {
        if (!this.canStartJumpSlam()) return false;
        this.startJumpSlam();
        return true;
    }

    canStartJumpSlam() {
        const logic = this.logic;
        if (this.getPhase() < 2) return false;
        if (this.getDistanceToCharacter() > 650) return false;
        const cooldown = this.getSlamCooldown();
        return Date.now() - logic.lastSlamTime >= cooldown;
    }

    startJumpSlam() {
        const logic = this.logic;
        logic.lastSlamTime = Date.now();
        logic.boss.stopWalkingAnimation();
        this.startAction('slam', 700, this.getDirectionToCharacter(), 1.5, 80);
    }

    getSlamCooldown() {
        return this.getPhase() === 3 ? 1800 : 2400;
    }

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

    isActionActive() {
        return Boolean(this.logic.action.type);
    }

    stepAction() {
        const type = this.logic.action.type;
        if (type === 'sprint') return this.stepSprint();
        if (type === 'slam') return this.stepSlam();
        if (type === 'telegraph') return this.stepTelegraph();
        return null;
    }

    stepTelegraph() {
        return null;
    }

    stepSprint() {
        this.stepMove(this.logic.action.direction, this.logic.action.speed);
    }

    stepSlam() {
        this.stepMove(this.logic.action.direction, this.logic.action.speed);
        this.updateHopY(this.logic.action.height);
    }

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

    clampToBounds() {
        const logic = this.logic;
        const minX = logic.boss.getMinX();
        const maxX = logic.boss.getMaxX();
        if (logic.boss.x < minX) logic.boss.x = minX;
        if (logic.boss.x > maxX) logic.boss.x = maxX;
    }

    updateHopY(height) {
        const logic = this.logic;
        const progress = this.getActionProgress();
        logic.boss.y = logic.action.baseY - height * Math.sin(Math.PI * progress);
    }

    getActionProgress() { const logic = this.logic; const elapsed = Date.now() - logic.action.startTime; const duration = logic.action.endTime - logic.action.startTime; return Math.min(1, elapsed / Math.max(1, duration)); }

    finishAction() {
        const logic = this.logic;
        const type = logic.action.type;
        const baseY = logic.action.baseY;
        const direction = logic.action.direction;
        this.resetAction(baseY);
        if (type === 'telegraph') this.startSprint(direction);
        if (type === 'slam') this.handleSlamLanding();
    }

    resetAction(baseY) {
        const logic = this.logic;
        logic.action = logic.createActionState(baseY);
        logic.boss.y = baseY;
    }

    startAction(type, duration, direction, speed, height) {
        const logic = this.logic;
        const now = Date.now();
        logic.action = { type, endTime: now + duration, direction, speed, startTime: now, baseY: logic.boss.y, height: height || 0 };
    }

    handleSlamLanding() {
        if (!this.isPlayerGrounded()) return;
        if (this.getDistanceToCharacter() > 180) return;
        this.logic.applyBossDamage();
    }

    isPlayerGrounded() {
        const character = this.logic.getChar();
        return character && !character.isAboveGround();
    }

    getPhase() {
        const energy = this.logic.boss.energy;
        if (energy <= 18) return 3;
        if (energy <= 35) return 2;
        return 1;
    }

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

    isCharacterDead() {
        return this.logic.getChar()?.isDead?.();
    }

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

    isNormalBlocked() {
        const boss = this.logic.boss;
        return boss.isAlerting || boss.isAttacking || boss.isHurting;
    }

    canMoveDirection(direction) { return direction < 0 ? this.canMoveLeft() : this.canMoveRight(); }

    canMoveLeft() {
        return this.logic.boss.x > this.logic.boss.getMinX();
    }

    canMoveRight() {
        return this.logic.boss.x < this.logic.boss.getMaxX();
    }

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

    getDirectionToCharacter() {
        const logic = this.logic;
        const character = logic.getChar();
        const endbossCenter = logic.boss.x + logic.boss.width / 2;
        const characterCenter = character.x + character.width / 2;
        return characterCenter < endbossCenter ? -1 : 1;
    }

    getDistanceToCharacter() {
        const logic = this.logic;
        const character = logic.getChar();
        if (!character) return Infinity;
        return logic.distX(logic.boss, character);
    }
}
