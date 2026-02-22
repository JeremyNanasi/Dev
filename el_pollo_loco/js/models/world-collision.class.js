/**
 * Handles collision detection and pickup logic for the world.
 * @property {World} world
 */
class WorldCollision {
    constructor(world) {
        this.world = world;
        this._dbgLastAt = {};
        this._lastContactEnemy = null;
        this._lastContactReason = 'other';
        globalThis.__EPL_LAST_COLLISION__ = this;
        if (typeof window !== 'undefined') { (window.EPL = window.EPL || {}).dumpCollisionData = () => globalThis.__EPL_LAST_COLLISION__?.dumpCollisionMetrics?.() ?? null; }
    }

    checkCollisions() {
        this.handleEnemyCollisions();
        this.handleIconCollisions();
        this.handleSalsaCollisions();
        this.handleThrowableCollisions();
    }

    handleEnemyCollisions() {
        const collisionConfig = this.getCollisionConfig();
        this.world.level.enemies.forEach((enemy) => {
            if (this.shouldSkipEnemy(enemy)) { return; }
            if (this.isStomping(this.world.character, enemy, collisionConfig)) {
                this.applyStompDamage(enemy); this.world.character.speedY = collisionConfig.bounceSpeed; return;
            }
            if (this.isSideHit(this.world.character, enemy, collisionConfig)) {
                this.applyCharacterContactDamage(enemy, collisionConfig);
            }
        });
    }

    shouldSkipEnemy(enemy) {
        return enemy instanceof Endboss
            || (typeof enemy.isDead === 'function' && enemy.isDead());
    }

    applyStompDamage(enemy) {
        if (typeof enemy.die === 'function') {
            enemy.die();
            return;
        }
        if (typeof enemy.takeDamage === 'function') {
            const damage = enemy.energy ?? 100;
            enemy.takeDamage(damage);
            return;
        }
        enemy.energy = 0;
        enemy.isDeadState = true;
    }

    handleIconCollisions() {
        this.collectCollidingItems(this.world.level.icons, (index) => this.collectIcon(index), true);
    }

    handleSalsaCollisions() {
        this.collectCollidingItems(this.world.level.salsa, (index) => this.collectSalsa(index), true);
    }

    collectCollidingItems(items, collectFn) {
        for (let i = items.length - 1; i >= 0; i--) {
            if (this.isCharacterColliding(items[i])) {
                collectFn(i);
            }
        }
    }

    isCharacterColliding(object) {
        if (this.isCollectibleObject(object)) {
            const characterPickupBox = this.getPickupBoxForCharacter();
            const objectPickupBox = this.getPickupBoxForObject(object);
            return this.isPickupColliding(characterPickupBox, objectPickupBox);
        }
        const characterBox = this.getCollisionBox(this.world.character);
        const objectBox = this.getCollisionBox(object);
        return this.isCollidingBoxes(characterBox, objectBox);
    }

    isCollectibleObject(object) {
        if (object?.isCollectible === true || object?.collectible === true || object?.type === 'collectible') {
            return true;
        }
        if (object instanceof Icons) {
            return true;
        }
        return object instanceof ThrowableObject && this.world.level?.salsa?.includes(object);
    }

    getPickupBoxForCharacter() {
        const x = this.world.character.x + 55;
        const y = this.world.character.y + 160;
        const width = 70;
        const height = 40;
        return { x, y, width, height, left: x, right: x + width, top: y, bottom: y + height };
    }

    getPickupBoxForObject(object) {
        const inset = 8;
        const x = object.x + inset;
        const y = object.y + inset;
        const width = Math.max(10, (object.width || 50) - inset * 2);
        const height = Math.max(10, (object.height || 50) - inset * 2);
        return { x, y, width, height, left: x, right: x + width, top: y, bottom: y + height };
    }

    isPickupColliding(characterPickupBox, objectPickupBox) {
        if (!this.isCollidingBoxes(characterPickupBox, objectPickupBox)) {
            return false;
        }
        const overlap = this.getOverlap(characterPickupBox, objectPickupBox);
        return overlap.x >= 10 && overlap.y >= 10;
    }

    handleThrowableCollisions() {
        for (let i = this.world.throwableObject.length - 1; i >= 0; i--) {
            if (this.isBottleHittingEnemy(this.world.throwableObject[i])) {
                this.world.throwableObject.splice(i, 1);
            }
        }
    }

    isBottleHittingEnemy(bottle) {
        for (let j = 0; j < this.world.level.enemies.length; j++) {
            const enemy = this.world.level.enemies[j];
            if (bottle.isColliding(enemy)) {
                this.applyBottleHit(enemy);
                return true;
            }
        }
        return false;
    }

    applyBottleHit(enemy) {
        enemy.takeDamage(10);
        if (enemy instanceof Endboss) {
            this.updateBossAfterHit(enemy);
        }
    }

    updateBossAfterHit(enemy) {
        enemy.updateHealthBar?.();
        if (enemy.energy <= 0 && typeof enemy.playDeathAnimation === 'function') {
            enemy.playDeathAnimation();
            return;
        }
        enemy.playHurtAnimation?.();
    }

    collectIcon(index) {
        this.world.level.icons.splice(index, 1);
        this.world.updateCoinCounter();
        this.world.updateStatusBars();
    }

    collectSalsa(index) {
        const [bottle] = this.world.level.salsa.splice(index, 1);
        if (bottle && typeof bottle.stopGroundAnimation === 'function') {
            bottle.stopGroundAnimation();
        }
        this.world.collectedSalsa += 1;
        this.world.refreshSalsaHud();
    }

    dbgContact(config, tag, payload) {
        if (!config?.debugContact) { return; }
        const now = Date.now();
        const lastAt = this._dbgLastAt?.[tag] ?? 0;
        if (now - lastAt < (config.debugThrottleMs ?? 120)) { return; }
        this._dbgLastAt[tag] = now;
        try { console.log(JSON.stringify({ tag, ...payload })); } catch (_) { }
    }

    getCollisionConfig() {
        return {
            stompVerticalTolerance: 30,
            stompMinOverlapX: 15,
            stompMinOverlapXRatio: 0.25,
            stompCenterMargin: 10,
            minOverlapX: 5,
            minOverlapY: 10,
            topGrace: 15,
            smallChickenBeakTipOffsetX: 0,
            smallChickenBeakInsideTolX: 4, smallChickenBeakOutsideTolX: 2,
            chickenBeakTipOffsetX: 6,
            chickenBeakInsideTolX: 4, chickenBeakOutsideTolX: 2,
            bounceSpeed: 15,
            defaultContactDamage: 5,
            debugContact: false,
            debugThrottleMs: 120,
            debugDeltaWindowPx: 40
        };
    }

    getDamageSnapshot(character) {
        return { energy: character.energy, lastHit: character.lastHit, cooldownOrHurtState: typeof character.isHurt === 'function' ? character.isHurt() : undefined };
    }

    logDamageApply(config, tag, enemy, reason, before, after) {
        this.dbgContact(config, tag, { enemyType: enemy.constructor?.name ?? 'unknown', reason, energyBefore: before.energy, energyAfter: after.energy, lastHitBefore: before.lastHit, lastHitAfter: after.lastHit, cooldownOrHurtState: after.cooldownOrHurtState });
    }

    applyCharacterContactDamage(enemy, config) {
        const character = this.world.character;
        const reason = this._lastContactEnemy === enemy ? this._lastContactReason : 'other';
        const damage = enemy.contactDamageAmount ?? config.defaultContactDamage;
        const before = this.getDamageSnapshot(character);
        this.logDamageApply(config, 'damage-before', enemy, reason, before, before);
        character.takeDamage(damage);
        const after = this.getDamageSnapshot(character);
        this.logDamageApply(config, 'damage-after', enemy, reason, before, after);
        this.world.statusBar.setPercentage((character.energy / 600) * 100);
    }

    getCollisionBox(object, offset = {}) {
        const baseX = object.getHitboxX?.() ?? object.x ?? 0;
        const baseY = object.getHitboxY?.() ?? object.y ?? 0;
        const baseWidth = object.getHitboxWidth?.() ?? object.width ?? 0;
        const baseHeight = object.getHitboxHeight?.() ?? object.height ?? 0;
        const x = baseX + (offset.x ?? 0);
        const y = baseY + (offset.y ?? 0);
        const width = baseWidth + (offset.width ?? 0);
        const height = baseHeight + (offset.height ?? 0);
        return { x, y, width, height, left: x, right: x + width, top: y, bottom: y + height };
    }

    isCollidingBoxes(aBox, bBox) {
        return aBox.right > bBox.left
            && aBox.left < bBox.right
            && aBox.bottom > bBox.top
            && aBox.top < bBox.bottom;
    }

    getOverlap(aBox, bBox) {
        const overlapX = Math.min(aBox.right, bBox.right) - Math.max(aBox.left, bBox.left);
        const overlapY = Math.min(aBox.bottom, bBox.bottom) - Math.max(aBox.top, bBox.top);
        return { x: Math.max(0, overlapX), y: Math.max(0, overlapY) };
    }

    getVerticalOverlapOnly(aBox, bBox) {
        const top = Math.max(aBox.top, bBox.top);
        const bottom = Math.min(aBox.bottom, bBox.bottom);
        return Math.max(0, bottom - top);
    }

    getCollisionPair(character, enemy) {
        const characterBox = this.getCollisionBox(character);
        const enemyBox = this.getCollisionBox(enemy);
        return { characterBox, enemyBox };
    }

    isFalling(character) {
        return character.speedY < 0;
    }

    getStompMinOverlap(enemyBox, config) {
        return Math.min(config.stompMinOverlapX, enemyBox.width * config.stompMinOverlapXRatio);
    }

    isWithinStompCenter(characterBox, enemyBox, config) {
        const characterCenterX = characterBox.left + characterBox.width / 2;
        return characterCenterX >= enemyBox.left - config.stompCenterMargin
            && characterCenterX <= enemyBox.right + config.stompCenterMargin;
    }

    isStomping(character, enemy, config) {
        const { characterBox, enemyBox } = this.getCollisionPair(character, enemy);
        if (!this.isCollidingBoxes(characterBox, enemyBox)) { return false; }
        if (!this.isFalling(character)) { return false; }
        const verticalPenetration = characterBox.bottom - enemyBox.top;
        if (verticalPenetration > config.stompVerticalTolerance) { return false; }
        const overlap = this.getOverlap(characterBox, enemyBox);
        if (overlap.x < this.getStompMinOverlap(enemyBox, config)) { return false; }
        return this.isWithinStompCenter(characterBox, enemyBox, config);
    }

    getContactTuning() {
        const defaults = {
            contactMaxGapX: 2,
            contactMinOverlapY: 5,
            characterInsetL: 0, characterInsetR: 0,
            chickenInsetL: 2, chickenInsetR: -3,
            smallChickenInsetL: 2, smallChickenInsetR: -8,
            endbossInsetL: 0, endbossInsetR: 0,
            rearMaxGapX: 55, rearMinOverlapY: 4, rearExtraBackPx: 4
        };
        return Object.assign({}, defaults, globalThis.__EPL_CONTACT_TUNING__ ?? {});
    }

    getVisualContactBox(entity, insetL, insetR) {
        const b = this.getCollisionBox(entity);
        return { left: b.left + insetL, right: b.right - insetR, top: b.top, bottom: b.bottom };
    }

    resolveContactBoxes(character, enemy, tuning) {
        const isSmall = enemy instanceof smallchicken;
        const isCk = typeof Chicken !== 'undefined' && enemy instanceof Chicken;
        const isEB = enemy instanceof Endboss;
        const eL = isSmall ? tuning.smallChickenInsetL : isCk ? tuning.chickenInsetL : isEB ? tuning.endbossInsetL : 0;
        const eR = isSmall ? tuning.smallChickenInsetR : isCk ? tuning.chickenInsetR : isEB ? tuning.endbossInsetR : 0;
        const charBox = this.getVisualContactBox(character, tuning.characterInsetL, tuning.characterInsetR);
        return { charBox, enemyBox: this.getVisualContactBox(enemy, eL, eR) };
    }

    isContactTouchX(charBox, enemyBox, gapX) {
        if (enemyBox.left >= charBox.left) return enemyBox.left <= charBox.right + gapX;
        return enemyBox.right >= charBox.left - gapX;
    }

    isContactDamageHit(character, enemy, tuning) {
        const t = tuning ?? this.getContactTuning();
        const config = this.getCollisionConfig();
        if (this.isStomping(character, enemy, config)) return false;
        const { charBox, enemyBox } = this.resolveContactBoxes(character, enemy, t);
        if (this.isFalling(character) && charBox.bottom <= enemyBox.top + config.topGrace) return false;
        const overlapY = Math.min(charBox.bottom, enemyBox.bottom) - Math.max(charBox.top, enemyBox.top);
        if (overlapY < t.contactMinOverlapY) return false;
        if (this.isContactTouchX(charBox, enemyBox, t.contactMaxGapX)) return true;
        return this.applyRearOverride(character, enemy, charBox, enemyBox, overlapY, t);
    }

    applyRearOverride(character, enemy, charBox, enemyBox, overlapY, t) {
        const isCk = typeof Chicken !== 'undefined' && enemy instanceof Chicken;
        const isSm = enemy instanceof smallchicken;
        if ((!isCk && !isSm) || character.otherDirection === undefined) return false;
        const eCX = (enemyBox.left + enemyBox.right) / 2, cCX = (charBox.left + charBox.right) / 2;
        if (character.otherDirection === true ? eCX < cCX : eCX >= cCX) return false;
        const rGap = t.rearMaxGapX ?? t.contactMaxGapX;
        const rMinY = t.rearMinOverlapY ?? t.contactMinOverlapY;
        const xPx = t.rearExtraBackPx ?? 0;
        const rBox = character.otherDirection === true ? { ...charBox, right: charBox.right + xPx } : { ...charBox, left: charBox.left - xPx };
        return overlapY >= rMinY && this.isContactTouchX(rBox, enemyBox, rGap);
    }

    dumpCollisionMetrics() {
        const char = this.world?.character;
        return {
            config: this.getCollisionConfig(), tuning: this.getContactTuning(),
            activeOverrides: globalThis.__EPL_CONTACT_TUNING__ ?? null,
            charBox: char ? this.getCollisionBox(char) : null,
            lastContactEnemy: this._lastContactEnemy?.constructor?.name ?? null,
            lastContactReason: this._lastContactReason
        };
    }

    isSideHit(character, enemy, config) {
        const tuning = this.getContactTuning();
        const result = this.isContactDamageHit(character, enemy, tuning);
        this._lastContactEnemy = enemy;
        this._lastContactReason = result ? 'contact' : 'other';
        return result;
    }
}
