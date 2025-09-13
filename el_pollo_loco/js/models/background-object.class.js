class BackgroundObject extends MoveableObject {

    width = 720;
    heigth = 400;
    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
        console.log(imagePath);
    }

    
}