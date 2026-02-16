/**
 * @fileoverview Documentation shadow for `js/models/sound-toggle.class.js`.
 * This file contains JSDoc only and is not loaded at runtime.
 */

/**
 * Per-enemy audio state tracked by the manager.
 * @typedef {Object} EnemySfxState
 * @property {boolean} inRange
 * @property {number|null} timeoutId
 * @property {boolean} deathPlayed
 * @property {boolean} blocked
 * @property {boolean} wasAlerting
 * @property {boolean} wasHurting
 * @property {HTMLAudioElement|null} currentAudio
 * @property {boolean} damageActive
 * @property {number} damageCooldownUntil
 */

/**
 * High-level contract of the enemy SFX manager.
 * @typedef {Object} EnemySfxManagerShape
 * @property {function(World): void} update
 * @property {function(): boolean} isEnabled
 * @property {function(boolean): void} setOrientationBlocked
 * @property {function(Object): EnemySfxState} getState
 * @property {function(Object[]): void} stopAll
 */

/**
 * High-level contract of the mute-toggle UI controller.
 * @typedef {Object} SoundToggleControllerShape
 * @property {function(): void} init
 * @property {function(): void} attachListener
 * @property {function(boolean): void} updateIcon
 */
