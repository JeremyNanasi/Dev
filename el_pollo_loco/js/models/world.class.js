class World {
    character = new Character();
    enemies = [
        new Chicken(),
        new Chicken(),
        new Chicken(),
    ];
    clouds = [
        new Cloud()
    ];
    canvas;
    ctx;

    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.draw();
    }

        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.heigt);
            this.ctx.drawImage(this.character.img, this.character.x, this.character.y, this.character.height, this.character.width);
            this.enemies.forEach(enemy => {
                this.ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.height, enemy.width);
            });

            this.clouds.forEach(cloud => {
            this.ctx.drawImage(cloud.img, cloud.x, cloud.y, cloud.height, cloud.width);
            });

            // Draw() wird immer wieder aufgerufen
            let self = this;
            requestAnimationFrame(function() {
                // self.draw();
            });
        }
}