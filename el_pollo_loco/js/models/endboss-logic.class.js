class EndbossLogic {
    constructor(boss) {
        this.boss = boss;
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
    start() {
        this.startMovement();
    }
    startMovement() { this.clearMovementInterval(); this.movementInterval = setInterval(() => { this.tick(); }, 1000 / 60); }
    clearMovementInterval() {
        if (!this.movementInterval) return;
        clearInterval(this.movementInterval);
        this.movementInterval = null;
    }
    tick() {
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
        if (this.updateJump()) return;
        this.applyContactDamage();
        if (this.updateAction()) return;
        if (this.tryTargetedJump()) return;
        if (this.tryJumpSlam()) return;
        if (this.trySprint()) return;
        if (this.tryAttackOrAlert()) return;
        this.handleMovement();
    }
    shouldSkipTick() {
        if (!this.boss.isHurting && !this.boss.isDeadState) return false;
        this.cancelJump();
        return true;
    }
    updateFacingDirection() {
        if (!this.canUpdateFacing()) return;
        const direction = this.getDirectionToCharacter();
        this.boss.otherDirection = direction > 0;
    }
    canUpdateFacing() {
        if (!this.getChar()) return false;
        return !this.isActionActive()
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
            || this.isActionActive();
    }
    shouldStartJump() {
        const character = this.getChar();
        if (!character || character.isDead?.()) return false;
        if (this.isBossBusy() || this.jump.active) return false;
        if (this.getDistanceToCharacter() < 400) return false;
        return this.nowMs() - this.lastJumpTime >= 2500;
    }
    tryTargetedJump() {
        if (!this.shouldStartJump()) return false;
        this.startJump();
        return true;
    }
    startJump() {
        const character = this.getChar();
        if (!character) return;
        const now = this.nowMs();
        this.lastJumpTime = now;
        this.jump = { active: true, startTime: now, baseX: this.boss.x, baseY: this.boss.y, targetX: this.centerX(character), height: 260, duration: 900, impactDone: false };
        this.boss.stopWalkingAnimation();
    }
    updateJump() {
        if (!this.jump.active) return false;
        const t = Math.min(1, (this.nowMs() - this.jump.startTime) / this.jump.duration);
        this.updateJumpPosition(t);
        if (this.isLandingTick(t)) this.applyLandingDamage();
        if (t >= 1) this.finishJump();
        return true;
    }
    updateJumpPosition(t) { this.updateJumpX(t); this.updateJumpY(t); }
    updateJumpX(t) {
        const landingX = this.jump.targetX - this.boss.width / 2;
        this.boss.x = this.jump.baseX + (landingX - this.jump.baseX) * t;
        this.clampToBounds();
    }
    updateJumpY(t) {
        const height = this.jump.height;
        this.boss.y = this.jump.baseY - 4 * height * t * (1 - t);
        if (t >= 1) this.boss.y = this.jump.baseY;
    }
    isLandingTick(t) {
        if (this.jump.impactDone) return false;
        if (t < 1) return false;
        this.jump.impactDone = true;
        return true;
    }
    applyLandingDamage() {
        const character = this.getChar();
        if (!character || character.isAboveGround()) return;
        if (this.directHit(character)) {
            this.applyBossDamage(300);
            return;
        }
        if (this.inShockwaveRange(character)) this.applyBossDamage(100);
    }
    directHit(character) {
        return character.isColliding(this.boss);
    }
    inShockwaveRange(character) {
        return Math.abs(this.centerX(character) - this.centerX(this.boss)) <= 520;
    }
    finishJump() { this.jump = this.createJumpState(); }
    cancelJump() {
        if (!this.jump.active) return;
        this.boss.y = this.jump.baseY;
        this.jump = this.createJumpState();
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
    handleMovement() {
        if (this.isCharacterDead()) return this.handleDeadMovement();
        const direction = this.getMovementDirection();
        if (direction === 0 || !this.canMoveDirection(direction)) {
            this.boss.stopWalkingAnimation();
            return;
        }
        this.boss.stopAlertLoopIfAny();
        this.boss.startWalkingAnimation();
        this.moveDirection(direction);
    }
    handleDeadMovement() {
        if (this.canMoveLeft()) {
            this.boss.otherDirection = false;
            this.boss.startWalkingAnimation();
            this.boss.moveLeft();
            return;
        }
        this.boss.stopWalkingAnimation();
    }
    isCharacterDead() {
        return this.getChar()?.isDead?.();
    }
    getMovementDirection() {
        const character = this.getChar();
        if (!character) return 0;
        if (this.isNormalBlocked()) return 0;
        const distance = this.getDistanceToCharacter();
        if (distance > this.boss.startMovingDistance) return 0;
        if (distance < 50) return 0;
        return this.getDirectionToCharacter();
    }
    isNormalBlocked() {
        return this.boss.isAlerting || this.boss.isAttacking || this.boss.isHurting;
    }
    canMoveDirection(direction) { return direction < 0 ? this.canMoveLeft() : this.canMoveRight(); }
    canMoveLeft() {
        return this.boss.x > this.boss.getMinX();
    }
    canMoveRight() {
        return this.boss.x < this.boss.getMaxX();
    }
    moveDirection(direction) {
        if (direction < 0) {
            this.boss.otherDirection = false;
            this.boss.moveLeft();
            return;
        }
        this.boss.otherDirection = true;
        this.boss.moveRight();
    }
    getDirectionToCharacter() {
        const character = this.getChar();
        const endbossCenter = this.boss.x + this.boss.width / 2;
        const characterCenter = character.x + character.width / 2;
        return characterCenter < endbossCenter ? -1 : 1;
    }
    getDistanceToCharacter() {
        const character = this.getChar();
        if (!character) return Infinity;
        return this.distX(this.boss, character);
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
        if (!this.isMidRange()) return false;
        if (this.boss.isAttacking || this.boss.isAlerting || this.boss.isHurting) return false;
        return true;
    }
    startSprintTelegraph() {
        this.boss.stopWalkingAnimation();
        this.boss.setAlertFrame();
        this.startAction('telegraph', 300, this.getDirectionToCharacter(), 1, 0);
    }
    startSprint(direction) {
        const multiplier = this.getSprintMultiplier();
        this.boss.stopAlertLoopIfAny();
        this.boss.startWalkingAnimation();
        this.startAction('sprint', 600, direction, multiplier, 0);
    }
    getSprintMultiplier() { const phase = this.getPhase(); return phase === 3 ? 3.8 : phase === 2 ? 3.4 : 3.0; }
    tryJumpSlam() {
        if (!this.canStartJumpSlam()) return false;
        this.startJumpSlam();
        return true;
    }
    canStartJumpSlam() {
        if (this.getPhase() < 2) return false;
        if (this.getDistanceToCharacter() > 650) return false;
        const cooldown = this.getSlamCooldown();
        return Date.now() - this.lastSlamTime >= cooldown;
    }
    startJumpSlam() {
        this.lastSlamTime = Date.now();
        this.boss.stopWalkingAnimation();
        this.startAction('slam', 700, this.getDirectionToCharacter(), 1.5, 80);
    }
    getSlamCooldown() {
        return this.getPhase() === 3 ? 1800 : 2400;
    }
    updateAction() {
        if (!this.isActionActive()) return false;
        if (Date.now() >= this.action.endTime) {
            this.finishAction();
            return true;
        }
        this.stepAction();
        return true;
    }
    isActionActive() {
        return Boolean(this.action.type);
    }
    stepAction() {
        if (this.action.type === 'sprint') return this.stepSprint();
        if (this.action.type === 'slam') return this.stepSlam();
        if (this.action.type === 'telegraph') return this.stepTelegraph();
        return null;
    }
    stepTelegraph() {
        return null;
    }
    stepSprint() {
        this.stepMove(this.action.direction, this.action.speed);
    }
    stepSlam() {
        this.stepMove(this.action.direction, this.action.speed);
        this.updateHopY(this.action.height);
    }
    stepMove(direction, multiplier) {
        const speed = this.boss.speed * multiplier;
        if (direction < 0) {
            this.boss.x -= speed;
        } else {
            this.boss.x += speed;
        }
        this.clampToBounds();
    }
    clampToBounds() {
        const minX = this.boss.getMinX();
        const maxX = this.boss.getMaxX();
        if (this.boss.x < minX) this.boss.x = minX;
        if (this.boss.x > maxX) this.boss.x = maxX;
    }
    updateHopY(height) {
        const progress = this.getActionProgress();
        this.boss.y = this.action.baseY - height * Math.sin(Math.PI * progress);
    }
    getActionProgress() { const elapsed = Date.now() - this.action.startTime; const duration = this.action.endTime - this.action.startTime; return Math.min(1, elapsed / Math.max(1, duration)); }
    finishAction() {
        const type = this.action.type;
        const baseY = this.action.baseY;
        const direction = this.action.direction;
        this.resetAction(baseY);
        if (type === 'telegraph') this.startSprint(direction);
        if (type === 'slam') this.handleSlamLanding();
    }
    resetAction(baseY) {
        this.action = this.createActionState(baseY);
        this.boss.y = baseY;
    }
    startAction(type, duration, direction, speed, height) {
        const now = Date.now();
        this.action = { type, endTime: now + duration, direction, speed, startTime: now, baseY: this.boss.y, height: height || 0 };
    }
    handleSlamLanding() {
        if (!this.isPlayerGrounded()) return;
        if (this.getDistanceToCharacter() > 180) return;
        this.applyBossDamage();
    }
    isPlayerGrounded() {
        const character = this.getChar();
        return character && !character.isAboveGround();
    }
    getPhase() {
        if (this.boss.energy <= 18) return 3;
        if (this.boss.energy <= 35) return 2;
        return 1;
    }
    onHurtEnd() {
        if (this.isDormant || this.inWake()) { this.boss.enterDormantMode(); return; }
        if (this.boss.isDeadState || this.isActionActive()) return;
        if (this.isMidRange()) this.startSprintTelegraph();
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
        character.hit(amount);
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
