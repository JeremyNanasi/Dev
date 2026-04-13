/**
 * @fileoverview
 * Builds and initializes the default level configuration (level1) including enemies, collectibles, clouds, and backgrounds.
 *
 * Provides helper builders to construct level entities with randomized placement where appropriate.
 */
const endbossSpawnX = 2500;
const bottleMinX = 200;
const bottleMaxX = endbossSpawnX - 500;

/**
 * Generates a random X coordinate for a collectible bottle within the allowed spawn range.
 * @returns {number} A randomized bottle X coordinate in pixels.
 */
const randomBottleX = () => bottleMinX + Math.random() * (bottleMaxX - bottleMinX);

/**
 * Initializes global `level1` with freshly constructed entities.
 * @returns {Level} The newly created level instance.
 */
function initLevel() {
    level1 = buildLevel1();
    return level1;
}

/**
 * Creates the complete level object with all layer/entity groups.
 * @returns {Level} The assembled level instance.
 */
function buildLevel1() {
    return new Level(buildEnemies(), buildClouds(), buildIcons(), buildSalsa(), buildBackgrounds());
}

/**
 * Creates the enemy set for level1 (chickens, small chickens, plus the endboss).
 * @returns {Array<Chicken|smallchicken|Endboss>} The list of enemies for the level.
 */
function buildEnemies() {
    return repeat(() => new Chicken(), 5)
        .concat(repeat(() => new smallchicken({ isSmall: true }), 4), [new Endboss()]);
}

/**
 * Creates the ambient cloud objects for level1.
 * @returns {Array<Cloud>} The list of cloud instances.
 */
function buildClouds() {
    return repeat(() => new Cloud(), 12);
}

/**
 * Creates the collectible icon/coin objects for level1 with randomized X positions.
 * @returns {Array<Icons>} The list of icon instances.
 */
function buildIcons() {
    return repeat(() => new Icons({ x: randomIconX() }), 20);
}

/**
 * Generates a random X coordinate for an icon/coin spawn.
 * @returns {number} A randomized icon X coordinate in pixels.
 */
function randomIconX() {
    return -750 + Math.random() * 750 * 3 + 800;
}

/**
 * Creates collectible throwable objects (bottles) for level1.
 * @returns {Array<ThrowableObject>} The list of collectible throwable objects.
 */
function buildSalsa() {
    return repeat(() => new ThrowableObject(randomBottleX(), 360, { isCollectible: true }), 9);
}

/**
 * Creates the background layer objects for level1 by concatenating several background sets.
 * @returns {Array<BackgroundObject>} Flattened list of background objects for the level.
 */
function buildBackgrounds() {
    const sets = [
        createBackgroundSet(-750, 2),
        createBackgroundSet(0, 1),
        createBackgroundSet(750, 2),
        createBackgroundSet(1500, 1),
        createBackgroundSet(2250, 2),
        createBackgroundSet(3000, 1)
    ];
    return sets.reduce((all, set) => all.concat(set), []);
}

/**
 * Creates one background set (air + 3 parallax layers) at a given X offset using a variant sprite index.
 * @param {number} x - Base X offset for the layer images.
 * @param {number} variant - Variant selector used in the layer sprite paths (e.g. 1 or 2).
 * @returns {Array<BackgroundObject>} The background objects for the given set.
 */
function createBackgroundSet(x, variant) {
    const v = String(variant);
    return [
        new BackgroundObject('./img/5_background/layers/air.png', x),
        new BackgroundObject(`./img/5_background/layers/3_third_layer/${v}.png`, x),
        new BackgroundObject(`./img/5_background/layers/2_second_layer/${v}.png`, x),
        new BackgroundObject(`./img/5_background/layers/1_first_layer/${v}.png`, x)
    ];
}

/**
 * Utility helper for building repeated collections.
 * @template T
 * @param {function(): T} factory - Factory callback invoked once per item.
 * @param {number} count - Number of items to create.
 * @returns {T[]} The generated list of items.
 */
function repeat(factory, count) {
    const items = [];
    for (let i = 0; i < count; i++) items.push(factory());
    return items;
}

initLevel();