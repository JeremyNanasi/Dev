/**
 * @fileoverview
 * Defines `StatusBar`, a HUD renderer for health, coins, bottles (and optional endboss) using sprite-based percentage frames.
 *
 * The bar selects an image based on the current `percentage` and draws it via `DrawableObject`.
 */

/**
 * @typedef {Object} StatusBarConfig
 * @property {string[]} images - Sprite paths used for the bar frames (0–100%).
 * @property {number} x - Canvas X position of the bar.
 * @property {number} y - Canvas Y position of the bar.
 * @property {number} width - Render width of the bar.
 * @property {number} height - Render height of the bar.
 * @property {number} percentage - Initial percentage for the bar.
 */

/**
 * HUD status bar for player health, coins, and bottles.
 * @extends DrawableObject
 */
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
    IMAGES_ENDBOSS_STATUSBAR = [
        './img/7_statusbars/2_statusbar_endboss/green/0.png',
        './img/7_statusbars/2_statusbar_endboss/green/20.png',
        './img/7_statusbars/2_statusbar_endboss/green/40.png',
        './img/7_statusbars/2_statusbar_endboss/green/60.png',
        './img/7_statusbars/2_statusbar_endboss/green/80.png',
        './img/7_statusbars/2_statusbar_endboss/green/100.png'
    ];
    percentage = 100;

    /**
     * Creates a status bar instance for the requested HUD type and applies optional layout overrides.
     * @param {'health'|'icons'|'bottles'|'endboss'} [type='health'] - Which bar style to render.
     * @param {Object} [overrides={}] - Optional overrides (position, size, images, initial percentage).
     */
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

    /**
     * Resolves the base configuration for a given bar type and merges caller overrides.
     * @param {'health'|'icons'|'bottles'|'endboss'} type - Bar type selector.
     * @param {Object} overrides - Optional overrides merged into the default configuration.
     * @returns {StatusBarConfig} The resolved configuration used to initialize the status bar.
     */
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
            },
        };
        const baseConfig = defaults[type] || defaults.health;
        return {
            ...baseConfig,
            ...overrides,
            images: overrides.images || baseConfig.images,
            percentage: overrides.percentage ?? baseConfig.percentage
        };
    }

    /**
     * Updates the bar percentage (clamped to 0–100) and switches to the matching sprite frame.
     * @param {number} percentage - New percentage value (0–100).
     * @returns {void}
     */
    setPercentage(percentage) {
        this.percentage = Math.max(0, Math.min(percentage, 100));
        const path = this.images[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    /**
     * Resolves the sprite index for the current percentage.
     * @returns {number} Index in the images array (0–5) representing the current fill level.
     */
    resolveImageIndex() {
        if (this.percentage <= 0) {
            return 0;
        } else if (this.percentage <= 20) {
            return 1;
        } else if (this.percentage <= 40) {
            return 2;
        } else if (this.percentage <= 60) {
            return 3;
        } else if (this.percentage <= 80) {
            return 4;
        } else {
            return 5;
        }
    }
}