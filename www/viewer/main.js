

/*
* main is the entry point of this application.
*/
define(function (require, exports, module) {
"use strict";

// Dependencies
require("3rd/three.min.r56");

// Common module testing
var utils = require('../common/utils.js');
console.log(utils.getSomething());

// # CSS Beautifier
// http://www.lonniebest.com/formatcss/

// LightTable
// http://www.chris-granger.com/lighttable/


/**
* Dependency Checking
*/
function _checkDependencies() {

    var key,
        missed       = false,
        dependencies = { "RequireJS": window.require, "jQuery": window.$ };

    for (key in dependencies) {
        if (!dependencies[key]) {
            missed = true;
            break;
        }
    }

    if (!missed) {
        return true;
    }

    // If some prequisitions are missed, error page is provided.
    document.write("<h1>Missing libraries</h1>");
    document.write("<p>Oops! One or more required libraries could not be found.</p>");
    document.write("<ul>");
    for (key in dependencies) {
        if (!dependencies[key]) {
            document.write("<li>" + key + "</li>");
        }
    }
    document.write("</ul>");

    return false;
}

function _setupCamTool() {

    // Zoom in
    $("#cam-widget-P").click(function() {
        sceneview.setCameraZoom(5);
    });

    // zoom out
    $("#cam-widget-M").click(function() {
        sceneview.setCameraZoom(-5);
    });

    // East
    $("#cam-widget-E").click(function() {
        sceneview.setCameraView('side');
    });

    // West
    $("#cam-widget-W").click(function() {
        sceneview.setCameraView('leftside');
    });

    // South
    $("#cam-widget-S").click(function() {
        sceneview.setCameraView('bottom');
    });

    // North
    $("#cam-widget-N").click(function() {
        sceneview.setCameraView('top');
    });

    // Rest view location
    $("#cam-widget-C").click(function() {
        sceneview.setCameraView('diagonal');
    });
}

function _onReady() {

    var SceneView = require("view/sceneview").SceneView;

    // Create Scene View
    // Currently, let's use global object to make things simple.
    window.sceneview = new SceneView("viewer");
    sceneview.setObjectColor('#C0D8F0');
    sceneview.initScene();
    sceneview.loadStlString(document.getElementById('stlstring').value);

    // Add Camera Tools
    _setupCamTool();
}


!function() {
    if(_checkDependencies()) {
        // Once DOM is loaded successfully, let's start loading the model to viewer.
        $(window.document).ready(_onReady);
    }
}();


});
