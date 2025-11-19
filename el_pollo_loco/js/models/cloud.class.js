class Cloud extends MoveableObject {
    y = 20;
    width = 500;
    height = 250;

    constructor() {
        super();
        this.loadImage('./img/5_background/layers/4_clouds/1.png');
        this.x = Math.random() * 2500;
        this.y = Math.random() * this.y;
        this.speed = Math.random() * 0.15;
        this.animate();
    }

    animate() {
        setInterval(() => {
            this.moveLeft();

            if (this.x + this.width < 0) {
                this.x = 800 + Math.random() * 300;
            }
        }, 1000 / 60);
    }
}