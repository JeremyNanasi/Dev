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
            }
        }, 1000 / 25);
    }


    isAboveGround() {
        if (this instanceof ThrowableObject) return true;
        return this.y < 180;
    }


    isColliding(mo) {
        return this.x + this.width > mo.x &&
            this.y + this.height > mo.y &&
            this.x < mo.x &&
            this.y < mo.y + mo.height;
    }


    hit() {
        this.energy -= 5;
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