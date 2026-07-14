'use strict';

// Browser entry point: exposes buildBurnPsbt on window for the plain-HTML/JS
// UI in index.html to call. Bundled by esbuild into a single dependency-free
// script — see package.json's "build:web" script.

const { buildBurnPsbt } = require('./burn');

window.BurnTool = { buildBurnPsbt };
