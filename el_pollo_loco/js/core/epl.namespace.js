(function() {
    if (window.EPL) return;

    window.EPL = {
        KEYS: {
            SOUND_ENABLED: 'sound-enabled',
            TOUCH_CONTROLS: 'touch-controls-preference',
            ORIENTATION_MODE: 'orientation-mode'
        },
        ORIENTATION_MODES: ['auto', 'portrait', 'landscape'],
        BREAKPOINT_MOBILE: 899,
        DEFAULT_CANVAS_WIDTH: 720,
        DEFAULT_CANVAS_HEIGHT: 480
    };
})();
