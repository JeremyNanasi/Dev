class World {
    character = new Character();
    enemies = ;
    clouds = ;
    backgroundObjects = ;
    ctx;
    canvas;
    keyboard;
    camera_x = 0;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
    }

    setWorld() {
        this.character.world = this;
    }

        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.heigt);

            this.ctx.translate(this.camera_x, 0);

            this.addobjectsToMap(this.backgroundObjects);

            this.addToMap(this.character);
            this.addobjectsToMap(this.clouds);
            this.addobjectsToMap(this.enemies);

            this.ctx.translate(-this.camera_x, 0);


            // Draw() wird immer wieder aufgerufen
            let self = this;
            requestAnimationFrame(function() {
                self.draw();
            });
        }

        addobjectsToMap(objects) {
            objects.forEach(o => {
                this.addToMap(o);
            });
        }

        addToMap(mo) {
            if(mo.otherDirection) {
                this.ctx.save();
                this.ctx.translate(mo.width, 0);
                this.ctx.scale(-1, 1);
                mo.x = mo.x * - 1;   //character is teleporting
            }
            this.ctx.drawImage(mo.img, mo.x, mo.y, mo.height, mo.width);
            if(mo.otherDirection) {
                mo.x = mo.x * - 1;
                this.ctx.restore();
            }
        }
    }
