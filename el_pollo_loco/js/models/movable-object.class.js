class MoveableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;
    currentImage = 0;


    frameTimers = {
        walking: 111.1,
        jumping: 250,
        hurt: 150,
        dead: 200
    };


    lastFrameTime = {
        walking: 0,
        jumping: 0,
        hurt: 0,
        dead: 0
    };


    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
                if (this.y < 0) this.y = 0;
                if (!this.isAboveGround() && this.speedY < 0) {
                    this.speedY = 0;
                    if (this.y > 180 && !(this instanceof ThrowableObject)) {
                        this.y = 180;
                    }
                }
            }
        }, 1000 / 25);
    }

    isAboveGround() {
        if (this instanceof ThrowableObject) return true;
        return this.y < 180;
    }


    isColliding(mo) {
        const thisX = this.getHitboxX();
        const thisY = this.getHitboxY();
        const thisWidth = this.getHitboxWidth();
        const thisHeight = this.getHitboxHeight();
        const moX = mo.getHitboxX?.() ?? mo.x;
        const moY = mo.getHitboxY?.() ?? mo.y;
        const moHeight = mo.getHitboxHeight?.() ?? mo.height;

        return thisX + thisWidth - 95 > moX &&
            thisY + thisHeight > moY &&
            thisX < moX &&
            thisY < moY + moHeight;
    }

    getHitboxX() {
        return this.x + (this.hitboxOffsetX ?? 0);
    }

    getHitboxY() {
        return this.y + (this.hitboxOffsetY ?? 0);
    }

    getHitboxWidth() {
        return this.hitboxWidth ?? this.width;
    }

    getHitboxHeight() {
        return this.hitboxHeight ?? this.height;
    }


    hit(amount = 5) {
        this.energy -= amount;
        if (this.energy < 0) this.energy = 0;
        else this.lastHit = Date.now();
    }


    isHurt() {
        return (Date.now() - this.lastHit) / 1000 < 1;
    }


    isDead() {
        return this.energy == 0;
    }


    playAnimation(images) {
        let i = this.currentImage % images.length;
        this.img = this.imageCache[images[i]];
        this.currentImage++;
    }

    playAnimationDead(images) {
        if (!this.currentImage) this.currentImage = 0;
        if (this.currentImage < images.length) {
            this.img = this.imageCache[images[this.currentImage]];
            this.currentImage++;
        } else {
            this.img = this.imageCache[images[images.length - 1]];
        }
    }

    moveRight() { 
        this.x += this.speed; 
    } 
    moveLeft() { 
        this.x -= this.speed; 
    }
}