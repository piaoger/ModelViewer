

define(function(require, exports, module) {
"use strict";

function log(message) {
    if (console) {
        console.log(message);
    }
}

function info(message) {
    switch (this.level) {
        case 'info':
        case 'debug':
            log('INFO: ' + message);
            break;
    }
};

function debug(message) {
    if (this.level === 'debug') {
        log('DEBUG: ' + message);
    }
};

//Exports Symbols
exports.level = 'info';
exports.log   = log;
exports.debug = debug;
exports.info  = info;

});