/**
 * @fileoverview
 * Defines `WorldCollision`, handling collision detection, stomp/contact rules, and pickup logic for world entities.
 */
class WorldCollision {
    /**
     * Initializes a new methods instance and sets up default runtime state.
     * The constructor prepares dependencies used by class behavior.
     * @param {World} world - World instance that provides level, character, and runtime access.
     */
    constructor(world) {
        this.world = world;
        this._dbgLastAt = {};
        this._lastContactEnemy = null;
        this._lastContactReason = 'other';
        globalThis.__EPL_LAST_COLLISION__ = this;
        if (typeof window !== 'undefined') { (window.EPL = window.EPL || {}).dumpCollisionData = () => globalThis.__EPL_LAST_COLLISION__?.dumpCollisionMetrics?.() ?? null; }
    }

    /**
     * Executes the check collisions routine.
     * The logic is centralized here for maintainability.
     */
    checkCollisions() {
        this.handleEnemyCollisions();
        this.handleIconCollisions();
        this.handleSalsaCollisions();
        this.handleThrowableCollisions();
    }

    /**
     * Handles enemy collisions.
     * It applies side effects required by this branch.
     */
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

    /**
     * Evaluates the skip enemy condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {object} enemy - Enemy instance being processed by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    shouldSkipEnemy(enemy) {
        return enemy instanceof Endboss
            || (typeof enemy.isDead === 'function' && enemy.isDead());
    }

    /**
     * Applies stomp damage.
     * The operation is isolated here to keep behavior predictable.
     * @param {object} enemy - Enemy instance being processed by this routine.
     */
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

    /**
     * Handles icon collisions.
     * It applies side effects required by this branch.
     */
    handleIconCollisions() {
        this.collectCollidingItems(this.world.level.icons, (index) => this.collectIcon(index), true);
    }

    /**
     * Handles salsa collisions.
     * It applies side effects required by this branch.
     */
    handleSalsaCollisions() {
        this.collectCollidingItems(this.world.level.salsa, (index) => this.collectSalsa(index), true);
    }

    /**
     * Collects colliding items.
     * The operation is isolated here to keep behavior predictable.
     * @param {Array<unknown>} items - Collection processed by this routine.
     * @param {Function} collectFn - Callback function executed by this helper.
     */
    collectCollidingItems(items, collectFn) {
        for (let i = items.length - 1; i >= 0; i--) {
            if (this.isCharacterColliding(items[i])) {
                collectFn(i);
            }
        }
    }

    /**
     * Evaluates the character colliding condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {unknown} object - Input value used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
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

    /**
     * Evaluates the collectible object condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {object} object - Object argument used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isCollectibleObject(object) {
        if (object?.isCollectible === true || object?.collectible === true || object?.type === 'collectible') {
            return true;
        }
        if (object instanceof Icons) {
            return true;
        }
        return object instanceof ThrowableObject && this.world.level?.salsa?.includes(object);
    }

    /**
     * Returns the pickup box for character.
     * This helper centralizes read access for callers.
     * @returns {unknown} Returns the value produced by this routine.
     */
    getPickupBoxForCharacter() {
        return this.getCollisionBox(this.world.character);
    }

    /**
     * Returns the pickup box for object.
     * This helper centralizes read access for callers.
     * @param {unknown} object - Input value used by this routine.
     * @returns {object} Returns an object containing computed state values.
     */
    getPickupBoxForObject(object) {
        const inset = 2;
        const objectBox = this.getCollisionBox(object);
        const x = objectBox.x + inset;
        const y = objectBox.y + inset;
        const width = Math.max(2, objectBox.width - inset * 2);
        const height = Math.max(2, objectBox.height - inset * 2);
        return { x, y, width, height, left: x, right: x + width, top: y, bottom: y + height };
    }

    /**
     * Evaluates the pickup colliding condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {unknown} characterPickupBox - Input value used by this routine.
     * @param {unknown} objectPickupBox - Input value used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isPickupColliding(characterPickupBox, objectPickupBox) {
        return this.isCollidingBoxes(characterPickupBox, objectPickupBox);
    }

    /**
     * Handles throwable collisions.
     * It applies side effects required by this branch.
     */
    handleThrowableCollisions() {
        for (let i = this.world.throwableObject.length - 1; i >= 0; i--) {
            if (this.isBottleHittingEnemy(this.world.throwableObject[i])) {
                this.world.throwableObject.splice(i, 1);
            }
        }
    }

    /**
     * Evaluates the bottle hitting enemy condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {object} bottle - Object argument used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
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

    /**
     * Applies bottle hit.
     * The operation is isolated here to keep behavior predictable.
     * @param {object} enemy - Enemy instance being processed by this routine.
     */
    applyBottleHit(enemy) {
        enemy.takeDamage(10);
        if (enemy instanceof Endboss) {
            this.updateBossAfterHit(enemy);
        }
    }

    /**
     * Updates boss after hit.
     * This synchronizes runtime state with current inputs.
     * @param {object} enemy - Enemy instance being processed by this routine.
     */
    updateBossAfterHit(enemy) {
        enemy.updateHealthBar?.();
        if (enemy.energy <= 0 && typeof enemy.playDeathAnimation === 'function') {
            enemy.playDeathAnimation();
            return;
        }
        enemy.playHurtAnimation?.();
    }

    /**
     * Collects icon.
     * The operation is isolated here to keep behavior predictable.
     * @param {number} index - Zero-based index of the target element.
     */
    collectIcon(index) {
        this.world.level.icons.splice(index, 1);
        this.world.updateCoinCounter();
        this.world.updateStatusBars();
    }

    /**
     * Collects salsa.
     * The operation is isolated here to keep behavior predictable.
     * @param {number} index - Zero-based index of the target element.
     */
    collectSalsa(index) {
        const [bottle] = this.world.level.salsa.splice(index, 1);
        if (bottle && typeof bottle.stopGroundAnimation === 'function') {
            bottle.stopGroundAnimation();
        }
        this.world.collectedSalsa += 1;
        this.world.refreshSalsaHud();
    }

    /**
     * Logs contact for diagnostics.
     * This helper supports runtime debugging visibility.
     * @param {object} config - Configuration object that defines thresholds and behavior.
     * @param {string} tag - Short tag that categorizes the diagnostic event.
     * @param {object} payload - Structured payload emitted for debugging output.
     */
    dbgContact(config, tag, payload) {
        if (!config?.debugContact) { return; }
        const now = Date.now();
        const lastAt = this._dbgLastAt?.[tag] ?? 0;
        if (now - lastAt < (config.debugThrottleMs ?? 120)) { return; }
        this._dbgLastAt[tag] = now;
        try { console.log(JSON.stringify({ tag, ...payload })); } catch (_) { }
    }

    /**
     * Returns the collision config.
     * This helper centralizes read access for callers.
     * @returns {object} Returns an object containing computed state values.
     */
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

    /**
     * Returns the damage snapshot.
     * This helper centralizes read access for callers.
     * @param {Character} character - Character instance involved in this operation.
     * @returns {object} Returns an object containing computed state values.
     */
    getDamageSnapshot(character) {
        return { energy: character.energy, lastHit: character.lastHit, cooldownOrHurtState: typeof character.isHurt === 'function' ? character.isHurt() : undefined };
    }

    /**
     * Logs damage apply for diagnostics.
     * This helper supports runtime debugging visibility.
     * @param {object} config - Configuration object that defines thresholds and behavior.
     * @param {string} tag - Short tag that categorizes the diagnostic event.
     * @param {object} enemy - Enemy instance being processed by this routine.
     * @param {string} reason - String value used by this routine.
     * @param {object} before - Object argument used by this routine.
     * @param {object} after - Object argument used by this routine.
     */
    logDamageApply(config, tag, enemy, reason, before, after) {
        this.dbgContact(config, tag, { enemyType: enemy.constructor?.name ?? 'unknown', reason, energyBefore: before.energy, energyAfter: after.energy, lastHitBefore: before.lastHit, lastHitAfter: after.lastHit, cooldownOrHurtState: after.cooldownOrHurtState });
    }

    /**
     * Applies character contact damage.
     * The operation is isolated here to keep behavior predictable.
     * @param {object} enemy - Enemy instance being processed by this routine.
     * @param {object} config - Configuration object that defines thresholds and behavior.
     */
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

    /**
     * Returns the collision box.
     * This helper centralizes read access for callers.
     * @param {unknown} object - Input value used by this routine.
     * @param {number} offset - Numeric value used by this routine.
     */
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

    /**
     * Evaluates the colliding boxes condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {object} aBox - Object argument used by this routine.
     * @param {object} bBox - Object argument used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isCollidingBoxes(aBox, bBox) {
        return aBox.right > bBox.left
            && aBox.left < bBox.right
            && aBox.bottom > bBox.top
            && aBox.top < bBox.bottom;
    }

    /**
     * Returns the overlap.
     * This helper centralizes read access for callers.
     * @param {object} aBox - Object argument used by this routine.
     * @param {object} bBox - Object argument used by this routine.
     * @returns {object} Returns an object containing computed state values.
     */
    getOverlap(aBox, bBox) {
        const overlapX = Math.min(aBox.right, bBox.right) - Math.max(aBox.left, bBox.left);
        const overlapY = Math.min(aBox.bottom, bBox.bottom) - Math.max(aBox.top, bBox.top);
        return { x: Math.max(0, overlapX), y: Math.max(0, overlapY) };
    }

    /**
     * Returns the vertical overlap only.
     * This helper centralizes read access for callers.
     * @param {object} aBox - Object argument used by this routine.
     * @param {object} bBox - Object argument used by this routine.
     * @returns {number} Returns the computed numeric value.
     */
    getVerticalOverlapOnly(aBox, bBox) {
        const top = Math.max(aBox.top, bBox.top);
        const bottom = Math.min(aBox.bottom, bBox.bottom);
        return Math.max(0, bottom - top);
    }

    /**
     * Returns the collision pair.
     * This helper centralizes read access for callers.
     * @param {Character} character - Character instance involved in this operation.
     * @param {unknown} enemy - Enemy instance being processed by this routine.
     * @returns {object} Returns an object containing computed state values.
     */
    getCollisionPair(character, enemy) {
        const characterBox = this.getCollisionBox(character);
        const enemyBox = this.getCollisionBox(enemy);
        return { characterBox, enemyBox };
    }

    /**
     * Evaluates the falling condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {Character} character - Character instance involved in this operation.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isFalling(character) {
        return character.speedY < 0;
    }

    /**
     * Returns the stomp min overlap.
     * This helper centralizes read access for callers.
     * @param {object} enemyBox - Object argument used by this routine.
     * @param {object} config - Configuration object that defines thresholds and behavior.
     * @returns {number} Returns the computed numeric value.
     */
    getStompMinOverlap(enemyBox, config) {
        return Math.min(config.stompMinOverlapX, enemyBox.width * config.stompMinOverlapXRatio);
    }

    /**
     * Evaluates the within stomp center condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {number} characterBox - Numeric value used by this routine.
     * @param {object} enemyBox - Object argument used by this routine.
     * @param {object} config - Configuration object that defines thresholds and behavior.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isWithinStompCenter(characterBox, enemyBox, config) {
        const characterCenterX = characterBox.left + characterBox.width / 2;
        return characterCenterX >= enemyBox.left - config.stompCenterMargin
            && characterCenterX <= enemyBox.right + config.stompCenterMargin;
    }

    /**
     * Evaluates the stomping condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {Character} character - Character instance involved in this operation.
     * @param {unknown} enemy - Enemy instance being processed by this routine.
     * @param {object} config - Configuration object that defines thresholds and behavior.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
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

    /**
     * Returns the contact tuning.
     * This helper centralizes read access for callers.
     * @returns {unknown} Returns the value produced by this routine.
     */
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

    /**
     * Returns the visual contact box.
     * This helper centralizes read access for callers.
     * @param {unknown} entity - Input value used by this routine.
     * @param {number} insetL - Numeric value used by this routine.
     * @param {number} insetR - Numeric value used by this routine.
     * @returns {object} Returns an object containing computed state values.
     */
    getVisualContactBox(entity, insetL, insetR) {
        const b = this.getCollisionBox(entity);
        return { left: b.left + insetL, right: b.right - insetR, top: b.top, bottom: b.bottom };
    }

    /**
     * Resolves contact boxes.
     * The operation is isolated here to keep behavior predictable.
     * @param {Character} character - Character instance involved in this operation.
     * @param {unknown} enemy - Enemy instance being processed by this routine.
     * @param {object} tuning - Object argument used by this routine.
     * @returns {object} Returns an object containing computed state values.
     */
    resolveContactBoxes(character, enemy, tuning) {
        const isSmall = enemy instanceof smallchicken;
        const isCk = typeof Chicken !== 'undefined' && enemy instanceof Chicken;
        const isEB = enemy instanceof Endboss;
        const eL = isSmall ? tuning.smallChickenInsetL : isCk ? tuning.chickenInsetL : isEB ? tuning.endbossInsetL : 0;
        const eR = isSmall ? tuning.smallChickenInsetR : isCk ? tuning.chickenInsetR : isEB ? tuning.endbossInsetR : 0;
        const charBox = this.getVisualContactBox(character, tuning.characterInsetL, tuning.characterInsetR);
        return { charBox, enemyBox: this.getVisualContactBox(enemy, eL, eR) };
    }

    /**
     * Evaluates the contact touch x condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {object} charBox - Object argument used by this routine.
     * @param {object} enemyBox - Object argument used by this routine.
     * @param {number} gapX - Numeric value used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isContactTouchX(charBox, enemyBox, gapX) {
        if (enemyBox.left >= charBox.left) return enemyBox.left <= charBox.right + gapX;
        return enemyBox.right >= charBox.left - gapX;
    }

    /**
     * Evaluates the contact damage hit condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {Character} character - Character instance involved in this operation.
     * @param {unknown} enemy - Enemy instance being processed by this routine.
     * @param {unknown} tuning - Input value used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
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

    /**
     * Applies rear override.
     * The operation is isolated here to keep behavior predictable.
     * @param {Character} character - Character instance involved in this operation.
     * @param {unknown} enemy - Enemy instance being processed by this routine.
     * @param {number} charBox - Numeric value used by this routine.
     * @param {number} enemyBox - Numeric value used by this routine.
     * @param {unknown} overlapY - Input value used by this routine.
     * @param {object} t - Object argument used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
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

    /**
     * Logs collision metrics for diagnostics.
     * This helper supports runtime debugging visibility.
     * @returns {object} Returns an object containing computed state values.
     */
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

    /**
     * Evaluates the side hit condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {Character} character - Character instance involved in this operation.
     * @param {unknown} enemy - Enemy instance being processed by this routine.
     * @param {object} config - Configuration object that defines thresholds and behavior.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isSideHit(character, enemy, config) {
        const tuning = this.getContactTuning();
        const result = this.isContactDamageHit(character, enemy, tuning);
        this._lastContactEnemy = enemy;
        this._lastContactReason = result ? 'contact' : 'other';
        return result;
    }
}
