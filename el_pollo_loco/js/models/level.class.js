/**
 * Aggregates all entities and layers that make up a playable level.
 */
class Level {
    enemies;
    clouds;
    icons;
    salsa;
    backgroundObjects;
    level_end_x = 2500;

    /**
     * @param {Array} [enemies=[]]
     * @param {Array} [clouds=[]]
     * @param {Array} [icons=[]]
     * @param {Array} [salsa=[]]
     * @param {Array} [backgroundObjects=[]]
     */
    constructor(enemies = [], clouds = [], icons = [], salsa = [], backgroundObjects = []) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.icons = icons;
        this.salsa = salsa;
        this.backgroundObjects = backgroundObjects;
    }
}
