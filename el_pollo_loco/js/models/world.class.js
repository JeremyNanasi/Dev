class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    throwableObject = [];

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
        this.checkCollisions();
        this.run();
    }

    setWorld() {
        this.character.world = this;
    }

    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
        }, 200);
    }

    checkThrowObjects() {
        if(this.keyboard.D) {
            let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
           this.throwableObject.push(bottle);
        }
    }

    checkCollisions() {
        setInterval(() => {
            this.level.enemies.forEach((enemy) => {
                if(this.character.isColliding(enemy)) {
                    this.character.hit();
                    this.statusBar.setPercentage(this.character.energy);
                }
            });

            for (let i = this.level.icons.length - 1; i >= 0; i--) {
                const icon = this.level.icons[i];
                if (this.character.isColliding(icon)) {
                    this.collectIcon(i);
                }
            }

            // new 
            for (let i = this.level.salsa.length - 1; i >= 0; i--) {
                const salsaBottle = this.level.salsa[i];
                if (this.character.isColliding(salsaBottle)) {
                    this.collectSalsa(i);
                }
            }
            //////////////
        }, 200);
    }

    collectIcon(index) {
        this.level.icons.splice(index, 1);
    }

    collectSalsa(index) {
        const [bottle] = this.level.salsa.splice(index, 1);
        if (bottle && typeof bottle.stopGroundAnimation === 'function') {
            bottle.stopGroundAnimation();
        }
    }

        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.translate(this.camera_x, 0);
            this.addobjectsToMap(this.level.backgroundObjects);

            this.ctx.translate(-this.camera_x, 0);
            this.addToMap(this.statusBar);
            this.ctx.translate(this.camera_x, 0);

            this.addToMap(this.character);
            this.addobjectsToMap(this.level.clouds);
            this.addobjectsToMap(this.level.enemies);
            this.addobjectsToMap(this.level.icons);
            this.addobjectsToMap(this.level.salsa);
            this.addobjectsToMap(this.throwableObject);

            this.ctx.translate(-this.camera_x, 0);


            // Draw() wird immer wieder aufgerufen
            let self = this;
            requestAnimationFrame(function() {
                self.draw();
            });
        }

        addobjectsToMap(objects) {
            if (!objects) {
                return;
            }
            objects.forEach(o => {
                this.addToMap(o);
            });
        }

        addToMap(mo) {
            if(mo.otherDirection) {
                this.flipImage(mo);
            }
            mo.draw(this.ctx);
            mo.drawFrame(this.ctx);


            if(mo.otherDirection) {
                this.flipImageBack(mo);
            }
        }
        
        flipImage(mo) {
                this.ctx.save();
                this.ctx.translate(mo.width, 0);
                this.ctx.scale(-1, 1);
                mo.x = mo.x * - 1;
        }

        flipImageBack(mo) {
            mo.x = mo.x * - 1;
            this.ctx.restore();
        }
    }
