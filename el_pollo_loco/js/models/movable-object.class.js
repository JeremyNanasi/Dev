class MoveableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;

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
        if(this.IMAGES_DEAD < 7)
        this.IMAGES_DEAD + 1;
        return this.energy == 0;
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;  // let i = 7 % 6; => 1, Rest 1     // i = 0, 1, 2, 3, 4, 5, 0  //endlose Schleife
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    // playAnimationDead() {
    //     if(this.IMAGES_DEAD > 7) {
    //         this.currentImage + 1; 
    //         console.log(this.IMAGES_DEAD);
             
    //     } else {
    //         console.log("you are Dead" + this.currentImage);
    //     }
    // }

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