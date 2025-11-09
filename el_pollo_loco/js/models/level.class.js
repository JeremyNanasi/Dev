class Level {
    enemies;
    clouds;
    icons;
    backgroundObjects;
    level_end_x = 2500;

    constructor(enemies = [], clouds = [], icons = [], backgroundObjects = []) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.icons = icons;
        this.backgroundObjects = backgroundObjects;
    }
}