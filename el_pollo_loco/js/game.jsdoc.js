/**
 * @fileoverview Documentation shadow for `js/game.js`.
 * This file contains JSDoc only and is not loaded at runtime.
 */

/**
 * Shared runtime state used during game bootstrap.
 * @typedef {Object} GameRuntimeState
 * @property {HTMLCanvasElement|null} canvas
 * @property {CanvasRenderingContext2D|null} ctx
 * @property {Keyboard|null} keyboard
 * @property {World|null} world
 * @property {boolean} controlsLocked
 * @property {boolean} endOverlayShown
 */

/**
 * Configuration contract for end-overlay presentation.
 * @typedef {Object} EndOverlayConfig
 * @property {'game-over'|'win'} type
 * @property {string} title
 * @property {string} hint
 * @property {number} [delayMs]
 */

/**
 * Initializes game state and controller wiring.
 * @callback InitFn
 * @returns {void}
 */

/**
 * Starts the game world if preconditions are fulfilled.
 * @callback StartGameFn
 * @returns {void}
 */

/**
 * Resizes canvas and applies current orientation/fullscreen layout.
 * @callback ResizeCanvasFn
 * @returns {void}
 */

/**
 * Computes and reports current game-over status.
 * @callback GetGameOverStatusFn
 * @returns {'alive'|'dead'|'won'}
 */

/**
 * Displays final overlay and synchronizes input hints.
 * @callback ShowEndOverlayFn
 * @param {EndOverlayConfig} config
 * @returns {void}
 */

/**
 * Public global API exposed by `js/game.js`.
 * @typedef {Object} GameApiShape
 * @property {InitFn} init
 * @property {StartGameFn} startGame
 * @property {ResizeCanvasFn} resizeCanvas
 * @property {GetGameOverStatusFn} getGameOverStatus
 * @property {ShowEndOverlayFn} showEndOverlay
 */
