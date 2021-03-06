
# 3D Model Viewer

It's a 3d model viewer originated from thingiviewer.

I had two goals while I starting up this project:

    1. Investigating on how to write shared code between server with client using AMD/RequireJS

    2. Learning three.js

## Changes

### Modular JavaScript Support

Splitting Thingiview into multiple modules.

require.js and amdefine are used for modular JavaScript, so that we can share some common modules between Browser and Node.js.



### Web Worker

loadmodelworker is a WebWorker which is used for load mesh models.

It is modified to be compatible with requireJS.


### Ui Changes

Camera Widgets is add. It's borrowed from Google earth and TinkerCAD.


### Udpate three.js library

Three.js used by original Thingiview is still Version 32. I updated it Version 32 to 56 for there are a couple interfaces changed since version 32.

Details:

  THREE.Camera used by origin Thingiview is is now deprecated:

      we should replace it with THREE.PerspectiveCamera;

      Use lookAt to set target;

  scene.addObject and scene.addLight were replaced with the simpler scene.add; Also removeObject, removeLight etc, are now just scene.remove.

  THREE.Vertex is deprecated and use THREE.Vector3 instead;

  THREE.UV is deprecated and use THREE.Vector2 instead;

  Gemetry.uvs is deprecated and use Geometry.faceVertexUvs instead.

### Use Node.js as web server

Use Node.js as web server, not PHP instead.

### Others

Fixed some minor issues found in Thingiview.

     XMLHttpRequest.status is 0 (not 200) for local file:// resources

## How to use

You can start the STL Viewer offline or from Node.js Web Server.

### Offline Viewer


You can view STL model Offline with browser supporting WebGL.


Chrome:

    startOffline_Chrome.bat

Firefox:

    startOffline_Firefox.bat

## Online Viewer

The Web Server is built on Node.js.

Development:

    startNodeServer_Development.bat

Production:

    startNodeServer_Production.bat

Terminate:

    stopNodeServer_All.bat

Node-inspector:

    startNodeDebugger.bat


## How to debug Node Server

Debugging Node Application with Eclipse or node-inspector. I am prefer using node-inspector .

1. Eclipse

    [Using Eclipse as Node Debugger] (https://github.com/joyent/node/wiki/Using-Eclipse-as-Node-Applications-Debugger)

2. node-inspector

    [Debugging with Node Inspector](http://howtonode.org/debugging-with-node-inspector)

    [The inspector debugging Node.js](http://www.noanylove.com/2011/12/node-the-inspector-debugging-node-js/)


## More model viewers on Github

### thingiviewer.js

Javascript 3D Model Viewer.

[thingiviewer.js @ Github](https://github.com/tbuser/thingiview.js)

### FI-STLCAD

Fisher Innovation STLCAD is a model preparation and slicing application for use when preapring 3D models for output on a 3D printer.

[FI-STLCAD @ Github](https://github.com/fisherinnovation/FI-STLCAD)


### githubiverse-template

This is a Github Page template to show off your 3D printer model or project. Inspiration clearly taken from the excellent Thingiverse.

[githubiverse-template @ Github](https://github.com/garyhodgson/githubiverse-template)


