level1 = new Level(
    [
        // new Chicken(),
        // new Chicken(),
        // new Chicken(),
        new Endboss(),
    ],
    [
        new Cloud()
    ],
    [
        new Icons()
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
    ]
);