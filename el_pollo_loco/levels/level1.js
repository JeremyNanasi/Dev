/**
 * @fileoverview Builds and initializes the default level configuration.
 */
const endbossSpawnX = 2500;
const bottleMinX = 200;
const bottleMaxX = endbossSpawnX - 500;
const randomBottleX = () => bottleMinX + Math.random() * (bottleMaxX - bottleMinX);

/**
 * Initializes global `level1` with freshly constructed entities.
 * @returns {Level}
 */
function initLevel() {
    level1 = buildLevel1();
    return level1;
}

/**
 * Creates the complete level object with all layer/entity groups.
 * @returns {Level}
 */
function buildLevel1() {
    return new Level(buildEnemies(), buildClouds(), buildIcons(), buildSalsa(), buildBackgrounds());
}

function buildEnemies() {
    return repeat(() => new Chicken(), 5)
        .concat(repeat(() => new smallchicken({ isSmall: true }), 4), [new Endboss()]);
}

function buildClouds() {
    return repeat(() => new Cloud(), 12);
}

function buildIcons() {
    return repeat(() => new Icons({ x: randomIconX() }), 20);
}

function randomIconX() {
    return -750 + Math.random() * 750 * 3 + 800;
}

function buildSalsa() {
    return repeat(() => new ThrowableObject(randomBottleX(), 360, { isCollectible: true }), 9);
}

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
 * @param {function(): T} factory
 * @param {number} count
 * @returns {T[]}
 */
function repeat(factory, count) {
    const items = [];
    for (let i = 0; i < count; i++) items.push(factory());
    return items;
}

initLevel();
