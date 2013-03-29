
// A sample module to share common JavaScript modules between Node.js with Browser.

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function(require, exports, module) {
"use strict";

    function _getSomething() {
        return "Getting _something??? ";
    }

    function getSomething() {
        return "Try to get something";
    }

//Exports Symbols
exports.getSomething = getSomething;
});