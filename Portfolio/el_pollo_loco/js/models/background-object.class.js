/**
 * Parallax background sprite anchored at a fixed world position.
@extends MoveableObject
 */
class BackgroundObject extends MoveableObject {
    width = 480;
    height = 750;
    /**
 * Creates a new instance.
 * @param {string} imagePath - Input value.
 * @param {number} x - X coordinate/dimension value.
 */
    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 0;
    }
}
