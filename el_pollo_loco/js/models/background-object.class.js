/**
 * Parallax background sprite anchored at a fixed world position.
 * @extends MoveableObject
 */
class BackgroundObject extends MoveableObject {

    width = 480;
    height = 750;
    

    /**
     * @param {string} imagePath
     * @param {number} x
     */
    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 0;
    }
}
