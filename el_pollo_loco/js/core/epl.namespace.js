window.EPL = window.EPL || {};
window.EPL.KEYS = window.EPL.KEYS || {};

if (!window.EPL.KEYS.SOUND_ENABLED) window.EPL.KEYS.SOUND_ENABLED = 'sound-enabled';
if (!window.EPL.KEYS.TOUCH_CONTROLS) window.EPL.KEYS.TOUCH_CONTROLS = 'touch-controls-preference';
if (!window.EPL.KEYS.ORIENTATION_MODE) window.EPL.KEYS.ORIENTATION_MODE = 'orientation-mode';

if (!Array.isArray(window.EPL.ORIENTATION_MODES) || !window.EPL.ORIENTATION_MODES.length) {
    window.EPL.ORIENTATION_MODES = ['auto', 'portrait', 'landscape'];
}
if (typeof window.EPL.BREAKPOINT_MOBILE !== 'number') window.EPL.BREAKPOINT_MOBILE = 899;
if (typeof window.EPL.DEFAULT_CANVAS_WIDTH !== 'number') window.EPL.DEFAULT_CANVAS_WIDTH = 720;
if (typeof window.EPL.DEFAULT_CANVAS_HEIGHT !== 'number') window.EPL.DEFAULT_CANVAS_HEIGHT = 480;
