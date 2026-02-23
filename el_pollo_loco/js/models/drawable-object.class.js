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
     * @param {string} path
     * @returns {void}
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }
    /** Runs `drawFrame`. */
    drawFrame() {
        return;
    }

    /**
     * Draws the current image onto the given canvas context.
     * @param {CanvasRenderingContext2D} ctx
     * @returns {void}
     */
    draw(ctx) {
        if (!this.img) {
            return;
        }
        ctx.drawImage(this.img, this.x, this.y, this.height, this.width);
    }

    /**
     * Preloads multiple sprite images into `imageCache`.
     * @param {string[]} arr
     * @returns {void}
     */
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        })
    }
}
