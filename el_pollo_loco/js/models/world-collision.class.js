/**
 * Handles collision detection and pickup logic for the world.
 * @property {World} world
 */
class WorldCollision {
    /**
     * @param {World} world
     */
    constructor(world) {
        this.world = world;
    }

    /**
     * Runs collision checks for enemies, pickups, and throwables.
     * @returns {void}
     */
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
                const damage = enemy.contactDamageAmount ?? collisionConfig.defaultContactDamage;
                this.world.character.takeDamage(damage);
                this.world.statusBar.setPercentage((this.world.character.energy / 600) * 100);
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

    getCollisionConfig() {
        return {
            stompVerticalTolerance: 30,
            stompMinOverlapX: 15,
            stompMinOverlapXRatio: 0.25,
            stompCenterMargin: 10,
            minOverlapX: 5,
            minOverlapY: 10,
            topGrace: 15,
            bounceSpeed: 15,
            defaultContactDamage: 5
        };
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

    /**
     * Determines whether the character is stomping an enemy.
     * @param {Object} character
     * @param {Object} enemy
     * @param {Object} config
     * @returns {boolean}
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

    isSideHit(character, enemy, config) {
        const { characterBox, enemyBox } = this.getCollisionPair(character, enemy);
        if (!this.isCollidingBoxes(characterBox, enemyBox)) { return false; }
        if (this.isStomping(character, enemy, config)) { return false; }
        const overlap = this.getOverlap(characterBox, enemyBox);
        if (overlap.x < config.minOverlapX || overlap.y < config.minOverlapY) { return false; }
        const characterBottom = characterBox.bottom;
        if (this.isFalling(character) && characterBottom <= enemyBox.top + config.topGrace) { return false; }
        return true;
    }
}
