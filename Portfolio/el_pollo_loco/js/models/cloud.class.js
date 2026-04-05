/**
 * @fileoverview
 * Defines `Cloud`, an ambient background entity that slowly moves left and wraps around
 * to create a continuous sky-layer effect during gameplay.
 */

/**
 * Ambient cloud layer element that loops across the sky.
 * @extends MoveableObject
 */
class Cloud extends MoveableObject {
    y = 20;
    width = 500;
    height = 250;

    /**
     * Initializes the cloud sprite, randomizes its initial position/speed, and starts the motion loop.
     */
    constructor() {
        super();
        this.loadImage('./img/5_background/layers/4_clouds/1.png');
        this.x = Math.random() * 2500;
        this.y = Math.random() * this.y;
        this.speed = Math.random() * 0.15;
        this.animate();
    }

    /**
     * Moves the cloud left continuously and wraps it back to the right side when it leaves the screen.
     */
    animate() {
        setInterval(() => {
            this.moveLeft();
            if (this.x + this.width < 0) {
                this.x = 800 + Math.random() * 300;
            }
        }, 1000 / 60);
    }
}