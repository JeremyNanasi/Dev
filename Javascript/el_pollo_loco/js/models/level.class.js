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
     * Creates a new instance.
     * @param {Array} [enemies=[]] - Enemy instances contained in the level.
     * @param {Array} [clouds=[]] - Cloud layer objects for background ambience.
     * @param {Array} [icons=[]] - Collectible icons/coins placed in the level.
     * @param {Array} [salsa=[]] - Collectible throwable objects (bottles) in the level.
     * @param {Array} [backgroundObjects=[]] - Background layer objects for parallax rendering.
     */
    constructor(enemies = [], clouds = [], icons = [], salsa = [], backgroundObjects = []) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.icons = icons;
        this.salsa = salsa;
        this.backgroundObjects = backgroundObjects;
    }
}