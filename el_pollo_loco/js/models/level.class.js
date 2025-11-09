class Level {
    enemies;
    clouds;
    icons;
    salsa;
    backgroundObjects;
    level_end_x = 2500;

    constructor(enemies = [], clouds = [], icons = [], salsa = [], backgroundObjects = []) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.icons = icons;
        this.salsa = salsa;
        this.backgroundObjects = backgroundObjects;
    }
}