class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    throwableObject = [];
    collectedSalsa = 0;
    lastThrowTime = 0;
    throwCooldownMs = 500;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
        this.checkCollisions();
        this.run();
        this.draw();
    }

    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach((enemy) => {
            enemy.world = this;
        });
    }

    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
        }, 200);
    }

    checkThrowObjects() {
        const now = Date.now();
        const canThrow = this.keyboard.D
            && this.collectedSalsa > 0
            && now - this.lastThrowTime >= this.throwCooldownMs;

        if (canThrow) {
            const bottle = new ThrowableObject(
                this.character.x + 100,
                this.character.y + 100,
                { isCollectible: false }
            );
            this.throwableObject.push(bottle);
            this.collectedSalsa -= 1;
            this.lastThrowTime = now;
        }
    }

    checkCollisions() {
        setInterval(() => {
            this.level.enemies.forEach((enemy) => {
                if (enemy instanceof Endboss) {
                    return;
                }

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
            for (let i = this.level.salsa.length - 1; i >= 0; i--) {
                const salsaBottle = this.level.salsa[i];
                if (this.character.isColliding(salsaBottle)) {
                    this.collectSalsa(i);
                }
            }

            for (let i = this.throwableObject.length - 1; i >= 0; i--) {
                const bottle = this.throwableObject[i];

                for (let j = 0; j < this.level.enemies.length; j++) {
                    const enemy = this.level.enemies[j];

                    if (bottle.isColliding(enemy)) {
                        enemy.hit(10);
                        if (enemy instanceof Endboss && typeof enemy.playHurtAnimation === 'function') {
                            enemy.playHurtAnimation();
                        }
                        this.throwableObject.splice(i, 1);
                        break;
                    }
                }
            }
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
        this.collectedSalsa += 1;
    }

        handleThrowableCollisions() {
        for (let i = this.throwableObject.length - 1; i >= 0; i--) {
            const bottle = this.throwableObject[i];

            for (const enemy of this.level.enemies) {
                if (enemy.isDead()) {
                    continue;
                }

                if (bottle.isColliding(enemy)) {
                    enemy.hit(10);
                    this.throwableObject.splice(i, 1);
                    break;
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.camera_x, 0);
        this.addobjectsToMap(this.level.backgroundObjects);

        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusBar);
        this.ctx.translate(this.camera_x, 0);

        this.addobjectsToMap(this.level.clouds);
        this.addToMap(this.character);
        this.addobjectsToMap(this.level.enemies);
        this.addobjectsToMap(this.level.icons);
        this.addobjectsToMap(this.level.salsa);
        this.addobjectsToMap(this.throwableObject);

        this.ctx.translate(-this.camera_x, 0);

        const animationFrame = window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || ((callback) => setTimeout(callback, 1000 / 60));

        animationFrame(() => this.draw());
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
