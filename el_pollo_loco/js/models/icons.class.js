class Icons extends MoveableObject {
    width = 50;
    height = 50;
    y = 360;
    
    ICONSOBJECTS = [
        './img/7_statusbars/3_icons/icon_coin.png',
        './img/8_coin/coin_1.png',
        './img/8_coin/coin_2.png'
    ];

    constructor({ x } = {}) {
        super().loadImage('./img/7_statusbars/3_icons/icon_coin.png');
        this.loadImages(this.ICONSOBJECTS);

        this.x = typeof x === 'number' ? x : 500 + Math.random() * 1000;
        this.speed = 0.15 + Math.random() * 0.5;
    }
}