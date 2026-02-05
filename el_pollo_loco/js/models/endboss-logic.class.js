class EndbossLogic {
    constructor(boss) {
        this.boss = boss;
        this.movementInterval = null;
        this.action = this.createActionState(boss.y);
        this.lastDamageTime = 0;
        this.lastSlamTime = 0;
    }

    createActionState(baseY) {
        return {
            type: null,
            endTime: 0,
            direction: 0,
            speed: 1,
            startTime: 0,
            baseY,
            height: 0
        };
    }

    start() {
        this.startMovement();
    }

    startMovement() {
        this.clearMovementInterval();
        this.movementInterval = setInterval(() => {
            this.tick();
        }, 1000 / 60);
    }

    clearMovementInterval() {
        if (!this.movementInterval) return;
        clearInterval(this.movementInterval);
        this.movementInterval = null;
    }

    tick() {
        if (this.shouldSkipTick()) return;
        this.updateFacingDirection();
        this.applyContactDamage();
        if (this.updateAction()) return;
        if (this.tryBackstep()) return;
        if (this.tryJumpSlam()) return;
        if (this.tryRetreat()) return;
        if (this.trySprint()) return;
        if (this.tryAttackOrAlert()) return;
        this.handleMovement();
    }

    shouldSkipTick() {
        return this.boss.isHurting || this.boss.isDeadState;
    }

    updateFacingDirection() {
        if (!this.canUpdateFacing()) return;
        const direction = this.getDirectionToCharacter();
        this.boss.otherDirection = direction > 0;
    }

    canUpdateFacing() {
        if (!this.getCharacter()) return false;
        return !this.isActionActive()
            && !this.boss.isAlerting
            && !this.boss.isAttacking
            && !this.boss.isHurting;
    }

    applyContactDamage() {
        if (!this.canApplyContactDamage()) return;
        this.applyBossDamage();
    }

    canApplyContactDamage() {
        const character = this.getCharacter();
        if (!character) return false;
        if (!this.isSideHit()) return false;
        return this.canDealDamage();
    }

    isSideHit() {
        const collisionConfig = this.getCollisionConfig();
        if (!collisionConfig) return false;
        return this.boss.world.isSideHit?.(this.boss.world.character, this.boss, collisionConfig);
    }

    getCollisionConfig() {
        return this.boss.world?.getCollisionConfig?.();
    }

    tryAttackOrAlert() {
        const distanceAhead = this.getDistanceAhead();
        return this.boss.handleAttackOrAlert(distanceAhead);
    }

    getDistanceAhead() {
        const character = this.getCharacter();
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
        return this.boss.world?.character?.isDead?.();
    }

    getMovementDirection() {
        const character = this.getCharacter();
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

    canMoveDirection(direction) {
        return direction < 0 ? this.canMoveLeft() : this.canMoveRight();
    }

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

    getCharacter() {
        return this.boss.world?.character;
    }

    getDirectionToCharacter() {
        const character = this.getCharacter();
        const endbossCenter = this.boss.x + this.boss.width / 2;
        const characterCenter = character.x + character.width / 2;
        return characterCenter < endbossCenter ? -1 : 1;
    }

    getDirectionAwayFromCharacter() {
        return this.getDirectionToCharacter() * -1;
    }

    getDistanceToCharacter() {
        const character = this.getCharacter();
        const endbossCenter = this.boss.x + this.boss.width / 2;
        const characterCenter = character.x + character.width / 2;
        return Math.abs(endbossCenter - characterCenter);
    }

    isCloseRange() {
        return this.getDistanceToCharacter() <= 180;
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
        this.startAction('sprint', 600, direction, multiplier, 0);
    }

    getSprintMultiplier() {
        const phase = this.getPhase();
        if (phase === 3) return 3.8;
        if (phase === 2) return 3.4;
        return 3.0;
    }

    tryRetreat() {
        if (!this.isCloseRange()) return false;
        if (this.boss.isAttacking || this.boss.isAlerting || this.boss.isHurting) return false;
        this.startRetreat();
        return true;
    }

    startRetreat() {
        const direction = this.getDirectionAwayFromCharacter();
        this.boss.stopWalkingAnimation();
        this.startAction('retreat', 300, direction, 2.4, 0);
    }

    tryBackstep() {
        if (!this.canStartBackstep()) return false;
        this.startBackstep();
        return true;
    }

    canStartBackstep() {
        const config = this.getCollisionConfig();
        if (!config) return false;
        const character = this.getCharacter();
        if (!character) return false;
        return this.boss.world.isStomping(character, this.boss, config);
    }

    startBackstep() {
        const direction = this.getDirectionAwayFromCharacter();
        this.boss.stopWalkingAnimation();
        this.startAction('backstep', 320, direction, 2.2, 45);
    }

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
        if (this.action.type === 'retreat') return this.stepRetreat();
        if (this.action.type === 'backstep') return this.stepBackstep();
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

    stepRetreat() {
        this.stepMove(this.action.direction, this.action.speed);
    }

    stepBackstep() {
        this.stepMove(this.action.direction, this.action.speed);
        this.updateHopY(this.action.height);
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

    getActionProgress() {
        const elapsed = Date.now() - this.action.startTime;
        const duration = this.action.endTime - this.action.startTime;
        return Math.min(1, elapsed / Math.max(1, duration));
    }

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
        this.action = {
            type,
            endTime: now + duration,
            direction,
            speed,
            startTime: now,
            baseY: this.boss.y,
            height: height || 0
        };
    }

    handleSlamLanding() {
        if (!this.isPlayerGrounded()) return;
        if (this.getDistanceToCharacter() > 180) return;
        this.applyBossDamage();
    }

    isPlayerGrounded() {
        const character = this.getCharacter();
        return character && !character.isAboveGround();
    }

    getPhase() {
        if (this.boss.energy <= 18) return 3;
        if (this.boss.energy <= 35) return 2;
        return 1;
    }

    onHurtEnd() {
        if (this.boss.isDeadState || this.isActionActive()) return;
        if (this.isCloseRange()) {
            this.startRetreat();
            return;
        }
        if (this.isMidRange()) {
            this.startSprintTelegraph();
        }
    }

    tryAttackDamage() {
        if (!this.isSideHit()) return false;
        if (!this.canDealDamage()) return false;
        this.applyBossDamage();
        return true;
    }

    applyBossDamage() {
        if (!this.canDealDamage()) return false;
        this.commitDamage();
        return true;
    }

    commitDamage() {
        const character = this.getCharacter();
        character.hit(200);
        this.lastDamageTime = Date.now();
        this.updatePlayerHud(character);
    }

    canDealDamage() {
        return Date.now() - this.lastDamageTime >= 900;
    }

    updatePlayerHud(character) {
        const percentage = (character.energy / 600) * 100;
        this.boss.world?.statusBar?.setPercentage(percentage);
    }
}
