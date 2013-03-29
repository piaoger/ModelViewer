
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function(require, exports, module) {
"use strict";
    
    function _getSomething() {
        return "_something";
    }

    function getSomething() {
        return "something";
    }

//Exports Symbols
exports.getSomething = getSomething;
});