/**
 * Base drawable entity with image loading and render helpers.
 */
class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 250;
    width = 100;
    height = 150;

    /**
     * Loads a single sprite image into `img`.
     * @param {string} path - Resource path or URL.
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Runs `drawFrame`.
     */
    drawFrame() {
        return;
    }

    /**
     * Draws the current image onto the given canvas context.
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
     */
    draw(ctx) {
        if (!this.img) {
            return;
        }
        ctx.drawImage(this.img, this.x, this.y, this.height, this.width);
    }

    /**
     * Loads multiple images into the internal cache for later animation rendering.
     * @param {string[]} arr - List of image paths to preload.
     */
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        })
    }
}