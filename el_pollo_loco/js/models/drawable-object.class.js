class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 250;
    width = 100;
    height = 150;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    drawFrame() {
        return;
    }

    draw(ctx) {
        if (!this.img) {
            return;
        }
        ctx.drawImage(this.img, this.x, this.y, this.height, this.width);
    }

    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        })
    }
}