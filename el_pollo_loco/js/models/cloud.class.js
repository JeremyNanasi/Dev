class Cloud extends MoveableObject {
    y = 20;
    width = 500;
    height = 250;

    constructor() {
        super();
        this.loadImage('./img/5_background/layers/4_clouds/1.png');
        this.x = Math.random() * 500;
        this.speed = 0.15; // Geschwindigkeit der Wolke
        this.animate();
    }

    animate() {
        setInterval(() => {
            this.moveLeft();

            // Optional: Wolke wieder rechts starten, wenn sie aus dem Bildschirm ist
            if (this.x + this.width < 0) {
                this.x = 800 + Math.random() * 300; // Bildschirmbreite + Zufall
            }
        }, 1000 / 60); // 60 FPS
    }
}