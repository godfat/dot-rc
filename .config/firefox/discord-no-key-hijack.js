// ==UserScript==
// @name         Block Discord from hijacking keys
// @namespace    https://www.godfat.org
// @version      2025-02-11
// @description  Shift + option can move between words again
// @author       godfat
// @match        https://discord.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (e.altKey) {  // if option is pressed along with arrow keys
        e.stopImmediatePropagation();
      }
    }
  }, true);
})();
