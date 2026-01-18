const endbossSpawnX = 2500;
const bottleMinX = 200;
const bottleMaxX = endbossSpawnX - 500;
const randomBottleX = () => bottleMinX + Math.random() * (bottleMaxX - bottleMinX);

level1 = new Level(
    [
        // new Chicken(),
        // new Chicken(),
        // new Chicken(),
        // new Chicken(),
        // new Chicken(),
        // new smallchicken({ isSmall: true }),
        // new smallchicken({ isSmall: true }),
        // new smallchicken({ isSmall: true }),
        // new smallchicken({ isSmall: true }),
        // new Endboss()
    ],
    [
        new Cloud(),
        new Cloud(),
        new Cloud(),
        new Cloud(),
        new Cloud(),
        new Cloud(),
        new Cloud(),
        new Cloud(),
        new Cloud(),
        new Cloud(),
        new Cloud(),
        new Cloud()
    ],
    [
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 }),
        new Icons({ x: -750 + Math.random() * 750*3 + 800 })
    ],
    [
        new ThrowableObject(randomBottleX(), 360, { isCollectible: true }),
        new ThrowableObject(randomBottleX(), 360, { isCollectible: true }),
        new ThrowableObject(randomBottleX(), 360, { isCollectible: true }),
        new ThrowableObject(randomBottleX(), 360, { isCollectible: true }),
        new ThrowableObject(randomBottleX(), 360, { isCollectible: true }),
        new ThrowableObject(randomBottleX(), 360, { isCollectible: true }),
        new ThrowableObject(randomBottleX(), 360, { isCollectible: true }),
        new ThrowableObject(randomBottleX(), 360, { isCollectible: true }),
        new ThrowableObject(randomBottleX(), 360, { isCollectible: true })
    ],
        
    [
        new BackgroundObject('./img/5_background/layers/air.png', -750),
        new BackgroundObject('./img/5_background/layers/3_third_layer/2.png', -750),
        new BackgroundObject('./img/5_background/layers/2_second_layer/2.png', -750),
        new BackgroundObject('./img/5_background/layers/1_first_layer/2.png', -750),

        new BackgroundObject('./img/5_background/layers/air.png', 0),
        new BackgroundObject('./img/5_background/layers/3_third_layer/1.png', 0),
        new BackgroundObject('./img/5_background/layers/2_second_layer/1.png', 0),
        new BackgroundObject('./img/5_background/layers/1_first_layer/1.png', 0),

        new BackgroundObject('./img/5_background/layers/air.png', 750),
        new BackgroundObject('./img/5_background/layers/3_third_layer/2.png', 750),
        new BackgroundObject('./img/5_background/layers/2_second_layer/2.png', 750),
        new BackgroundObject('./img/5_background/layers/1_first_layer/2.png', 750),

        new BackgroundObject('./img/5_background/layers/air.png', 750*2),
        new BackgroundObject('./img/5_background/layers/3_third_layer/1.png', 750*2),
        new BackgroundObject('./img/5_background/layers/2_second_layer/1.png', 750*2),
        new BackgroundObject('./img/5_background/layers/1_first_layer/1.png', 750*2),
        
        new BackgroundObject('./img/5_background/layers/air.png', 750*3),
        new BackgroundObject('./img/5_background/layers/3_third_layer/2.png', 750*3),
        new BackgroundObject('./img/5_background/layers/2_second_layer/2.png', 750*3),
        new BackgroundObject('./img/5_background/layers/1_first_layer/2.png', 750*3),

        new BackgroundObject('./img/5_background/layers/air.png', 750*4),
        new BackgroundObject('./img/5_background/layers/3_third_layer/1.png', 750*4),
        new BackgroundObject('./img/5_background/layers/2_second_layer/1.png', 750*4),
        new BackgroundObject('./img/5_background/layers/1_first_layer/1.png', 750*4),
    ]
);