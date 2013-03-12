

/*
* main is the entry point of this application.
*/
define(function (require, exports, module) {
"use strict";

// Dependencies
require("3rd/three.min.r32");


// # CSS Beautifier
// http://www.lonniebest.com/formatcss/

// LightTable
// http://www.chris-granger.com/lighttable/


// Prequisition Checking
function _checkPrequisition() {

    var dependencies = { "RequireJS": window.require};
    var key, allOK = true;
    for (key in dependencies) {
        if (!dependencies[key]) {
            allOK = false;
            break;
        }
    }
    if (allOK) {
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
            sceneview.setCameraView('side');
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

        /*
        // Fit view to selections
        $("#cam-widget-CS").click(function() {
            a.Hi();
            a.s();
            return n
        });


        // Home help
        $("#cam-widget-H").click(function() {
            $("#cam-help-bubble").is(":visible") ? $("#cam-help-bubble").fadeOut(100) : $("#cam-help-bubble").fadeIn(50);
            return n
        });

        $("#cam-help-bubble-close").click(function() {
            $("#cam-help-bubble").fadeOut(100);
            return n
        });
*/
}

function _onReady() {

    var SceneView = require("view/sceneview").SceneView;

    window.sceneview = new SceneView("viewer");
    sceneview.setObjectColor('#C0D8F0');
    sceneview.initScene();
    // sceneview.setShowPlane(true);
    sceneview.loadStlString(document.getElementById('stlstring').value);


    _setupCamTool()
}


if(_checkPrequisition()) {

    // If DOM is loaded succefully, let's start loading the model to viewer.
    $(window.document).ready(_onReady);
}

});
