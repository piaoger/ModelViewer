
# 3D Model Viewer

It's a 3d model viewer originated from thingiviewer.


## Changes

### Module Support

require.js is used for module support.

requireJS compatible require will also been used in Node Server side in the future.


### Web Worker


### Ui Changes

Camera Widgets is introduced.

### Udpate three.js from version 32 to version 56

THREE.Camera is now deprecated:
    we should replace it with THREE.PerspectiveCamera;
    Use lookAt to set target;
scene.addObject and scene.addLight were replaced with the simpler scene.add; Also removeObject, removeLight etc, are now just scene.remove. 

THREE.Vertex is deprecated and use THREE.Vector3 instead;
THREE.UV is deprecated and use THREE.Vector2 instead;
Gemetry.uvs is deprecated and use Geometry.faceVertexUvs instead.


## How to use

### Offline Viewer

Chrome:  startChrome.bat
Firefox: startFirefox.bat

## Online Viewer

The Web Server is built on Node.js.

Development:   startNodeServer_Development.bat
Production:    startNodeServer_Production.bat

Terminate:     stopNodeServer_All.bat

## How to debug Node Server

Debugging Node Application

1. Eclipse:

[Using Eclipse as Node Debugger] (https://github.com/joyent/node/wiki/Using-Eclipse-as-Node-Applications-Debugger)

2. node-inspector:

http://howtonode.org/debugging-with-node-inspector
http://www.noanylove.com/2011/12/node-the-inspector-debugging-node-js/

## References

### FI-STLCAD

Fisher Innovation STLCAD is a model preparation and slicing application for use when preapring 3D models for output on a 3D printer.

https://github.com/fisherinnovation/FI-STLCAD


### githubiverse-template

This is a Github Page template to show off your 3D printer model or project. Inspiration clearly taken from the excellent Thingiverse.

https://github.com/garyhodgson/githubiverse-template

## More Information

TODO


