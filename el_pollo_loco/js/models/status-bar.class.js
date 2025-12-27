class StatusBar extends DrawableObject {
    IMAGES = [
        './img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png'
    ];

    IMAGES_ICONS_STATUSBAR = [
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png'
    ];

    IMAGES_BOTTLES_STATUSBAR = [
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png'
    ];

    percentage = 100;

    constructor(type = 'health', overrides = {}) {
        super();
        this.type = type;
        const config = this.getConfiguration(type, overrides);
        this.images = config.images;
        this.loadImages(this.images);
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.percentage = config.percentage;
        this.setPercentage(this.percentage);
    }

    getConfiguration(type, overrides) {
        const defaults = {
            health: {
                images: this.IMAGES,
                x: 40,
                y: 10,
                width: 50,
                height: 180,
                percentage: 100
            },
            icons: {
                images: this.IMAGES_ICONS_STATUSBAR,
                x: 40,
                y: 50,
                width: 50,
                height: 180,
                percentage: 0
            },
            bottles: {
                images: this.IMAGES_BOTTLES_STATUSBAR,
                x: 40,
                y: 90,
                width: 50,
                height: 180,
                percentage: 0
            }
        };

        const baseConfig = defaults[type] || defaults.health;

        return {
            ...baseConfig,
            ...overrides,
            images: overrides.images || baseConfig.images,
            percentage: overrides.percentage ?? baseConfig.percentage
        };
    }

    setPercentage(percentage) {
        this.percentage = Math.max(0, Math.min(percentage, 100));
        const path = this.images[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    resolveImageIndex() {
        if (this.percentage == 100) {
            return 5;
        } else if (this.percentage > 80) {
            return 4;
        } else if (this.percentage > 60) {
            return 3; 
        } else if (this.percentage > 40) {
            return 2;
        } else if (this.percentage > 20) {
            return 1;
        } else {
            return 0;
        }
    }
}