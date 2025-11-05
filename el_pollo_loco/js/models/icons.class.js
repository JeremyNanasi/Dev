class Icons {
    
    ICONSOBJECTS = [
        './img/7_statusbars/3_icons/icon_coin.png',
        './img/8_coin/coin_1.png',
        './img/8_coin/coin_2.png'
    ];

    constructor() {
        super().loadImage('./img/7_statusbars/3_icons/icon_coin.png');
        this.loadImages(this.ICONSOBJECTS);

        this.x = 200 + Math.random() * 500;  // Zahl zwischen 200 und 700
        this.speed = 0.15 + Math.random() * 0.5;
    }

// das bild soll nicht laden und es funktioniert besser ohne super()
// bild funktioniert
}