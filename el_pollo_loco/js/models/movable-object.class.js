class MoveableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;
    lastFrameChange = 0;
    
    frameTimers = {
        walking: 100,
        jumping: 100,
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
            if(this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 25);
    }

    isAboveGround() {
        if(this instanceof ThrowableObject) {
            return true;
        } else {
            return this.y < 180;
        }
    }

    // character.isColliding(Chicken);
    isColliding(mo) {
        return this.x + this.width > mo.x &&
            this.y + this.height > mo.y &&
            this.x < mo.x &&
            this.y < mo.y + mo.height;
    }

    hit() {
        this.energy -= 5;
        if(this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt() {
        let timepassed = new Date().getTime() - this.lastHit;  //Difference in Millisekunden
        timepassed = timepassed / 1000; //Difference in Sekunden
        return timepassed < 1;
    }

    isDead() {
        return this.energy == 0;
    }

    playAnimation(images) {            
            let i = this.currentImage % images.length;  // let i = 7 % 6; => 1, Rest 1     // i = 0, 1, 2, 3, 4, 5, 0  //endlose Schleife
            let path = images[i];
            this.img = this.imageCache[path];
            this.currentImage++;
    }

    playAnimationDead(images) {
        if(!this.currentImage) this.currentImage = 0;

        if(this.currentImage < images.length) {
            this.img = this.imageCache[images[this.currentImage]];
            this.currentImage++;
        } else {
            // Bleibt beim letzten Bild
            this.img = this.imageCache[images[images.length - 1]];
        }
    }

    moveRight() {
        this.x += this.speed;
    }
    
    moveLeft() {
        this.x -= this.speed;
    }

    jump() {
        this.speedY = 30;
    }
}