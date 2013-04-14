
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */

define(function (require, exports, module) {
//"use strict";

/*
* Model Viewer
*/
function SceneView(containerId) {

    var StlGeometry = require("model/stlgeometry").StlGeometry;
        log         = require('../../common/log').log;

    var scope = this;


    var container = document.getElementById(containerId);

    // var stats = null;

    var camera   = null,
        scene    = null,
        renderer = null,
        object   = null,
        plane    = null;

    var ambientLight     = null,
        directionalLight = null,
        pointLight       = null;

    var targetXRotation             = 0,
        targetXRotationOnMouseDown  = 0,
        mouseX                      = 0,
        mouseXOnMouseDown           = 0;

    var targetYRotation             = 0,
        targetYRotationOnMouseDown  = 0,
        mouseY                      = 0,
        mouseYOnMouseDown           = 0;

    var mouseDown                   = false,
        mouseOver                   = false;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2

    var view         = null;
    var infoMessage  = null;
    var progressBar  = null;
    var alertBox     = null;

    var timer        = null;

    var rotateTimer    = null;
    var rotateListener = null;
    var wasRotating    = null;

    var cameraView = 'diagonal';
    var cameraZoom = 0;
    var rotate = false;
    var backgroundColor = '#606060';
    var objectMaterial = 'solid';
    var objectColor = 0xffffff;
    var showPlane = true;
    var useWebGl = false;

    var geometry;

    var workers = [];

    var width = 0;
    var height = 0;

    this.containerId  = containerId;

    // Set Viewer size
    if (document.defaultView && document.defaultView.getComputedStyle) {
        width  = parseFloat(document.defaultView.getComputedStyle(container,null).getPropertyValue('width'));
        height = parseFloat(document.defaultView.getComputedStyle(container,null).getPropertyValue('height'));
    } else {
        width  = parseFloat(container.currentStyle.width);
        height = parseFloat(container.currentStyle.height);
    }


    this.initScene = function() {

        container.style.position = 'relative';
        container.innerHTML = '';

        // set some camera attributes
        var viewAngle = 45,
            aspect    = width / height,
            near      = 0.1,
            far       = 10000;
        camera = new THREE.PerspectiveCamera (viewAngle, aspect, near, far);
        camera.updateMatrix();

        scene  = new THREE.Scene();

        ambientLight = new THREE.AmbientLight(0x202020);
        scene.add(ambientLight);

        directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
        directionalLight.position.x = 1;
        directionalLight.position.y = 1;
        directionalLight.position.z = 2;
        directionalLight.position.normalize();
        scene.add(directionalLight);

        pointLight = new THREE.PointLight(0xffffff, 0.3);
        pointLight.position.x = 0;
        pointLight.position.y = -25;
        pointLight.position.z = 10;
        scene.add(pointLight);

        progressBar = document.createElement('div');
        progressBar.style.position = 'absolute';
        progressBar.style.top = '0px';
        progressBar.style.left = '0px';
        progressBar.style.backgroundColor = 'red';
        progressBar.style.padding = '5px';
        progressBar.style.display = 'none';
        progressBar.style.overflow = 'visible';
        progressBar.style.whiteSpace = 'nowrap';
        progressBar.style.zIndex = 100;
        container.appendChild(progressBar);

        alertBox = document.createElement('div');
        alertBox.id = 'alertBox';
        alertBox.style.position = 'absolute';
        alertBox.style.top = '25%';
        alertBox.style.left = '25%';
        alertBox.style.width = '50%';
        alertBox.style.height = '50%';
        alertBox.style.backgroundColor = '#dddddd';
        alertBox.style.padding = '10px';
        // alertBox.style.overflowY = 'scroll';
        alertBox.style.display = 'none';
        alertBox.style.zIndex = 100;
        container.appendChild(alertBox);

        if (showPlane) {
           loadPlaneGeometry();
        }

        this.setCameraView(cameraView);
        this.setObjectMaterial(objectMaterial);

        // Create Render based on browser support.
        // If no WebGL support, just uses Canvas Renderer.
        var testCanvas = document.createElement('canvas');
        try {
            if (testCanvas.getContext('experimental-webgl')) {
                // showPlane = false;
                useWebGl = true;
                renderer = new THREE.WebGLRenderer();
                // renderer = new THREE.CanvasRenderer();
            } else {
                renderer = new THREE.CanvasRenderer();
            }
        } catch(e) {
            renderer = new THREE.CanvasRenderer();
            // log("failed webgl detection");
        }

        // renderer.setSize(container.innerWidth, container.innerHeight);

        renderer.setSize(width, height);
        renderer.sortObjects = false;
        renderer.sortElements = false;
        renderer.domElement.style.backgroundColor = backgroundColor;
        container.appendChild(renderer.domElement);

        // stats = new Stats();
        // stats.domElement.style.position  = 'absolute';
        // stats.domElement.style.top       = '0px';
        // container.appendChild(stats.domElement);

        // TODO: figure out how to get the render window to resize when window resizes
        // window.addEventListener('resize', onContainerResize(), false);
        // container.addEventListener('resize', onContainerResize(), false);

        window.addEventListener('mousemove',      onRendererMouseMove,     false);
        window.addEventListener('mouseup',        onRendererMouseUp,       false);

        // renderer.domElement.addEventListener('mousemove',      onRendererMouseMove,     false);
        renderer.domElement.addEventListener('mouseover',      onRendererMouseOver,     false);
        renderer.domElement.addEventListener('mouseout',       onRendererMouseOut,      false);
        renderer.domElement.addEventListener('mousedown',      onRendererMouseDown,     false);
        // renderer.domElement.addEventListener('mouseup',        onRendererMouseUp,       false);

        renderer.domElement.addEventListener('touchstart',     onRendererTouchStart,    false);
        renderer.domElement.addEventListener('touchend',       onRendererTouchEnd,      false);
        renderer.domElement.addEventListener('touchmove',      onRendererTouchMove,     false);

        renderer.domElement.addEventListener('DOMMouseScroll', onRendererScroll,        false);
        renderer.domElement.addEventListener('mousewheel',     onRendererScroll,        false);
        renderer.domElement.addEventListener('gesturechange',  onRendererGestureChange, false);
    };

    // FIXME
    // onContainerResize = function(event) {
    //   width  = parseFloat(document.defaultView.getComputedStyle(container,null).getPropertyValue('width'));
    //   height = parseFloat(document.defaultView.getComputedStyle(container,null).getPropertyValue('height'));
    //
    //   // log("resized width: " + width + ", height: " + height);
    //
    //   if (renderer) {
    //     renderer.setSize(width, height);
    //     camera.projectionMatrix = THREE.Matrix4.makePerspective(70, width / height, 1, 10000);
    //     renderScene();
    //   }
    // };

    var onRendererScroll = function(event) {
        event.preventDefault();

        var rolled = 0;

        if (event.wheelDelta === undefined) {
            // Firefox
            // The measurement units of the detail and wheelDelta properties are different.
            rolled = -40 * event.detail;
        } else {
            rolled = event.wheelDelta;
        }

        if (rolled > 0) {
            // up
            scope.setCameraZoom(+10);
        } else {
            // down
            scope.setCameraZoom(-10);
        }
    };

    var onRendererGestureChange = function(event) {
        event.preventDefault();

        if (event.scale > 1) {
            scope.setCameraZoom(+5);
        } else {
            scope.setCameraZoom(-5);
        }
    };

    var onRendererMouseOver = function(event) {
        mouseOver = true;
        // targetRotation = object.rotation.z;
        if (timer == null) {
            // log('starting loop');
            timer = setInterval(renderScene, 1000/60);
        }
    };

    var onRendererMouseDown = function(event) {
        // log("down");

        event.preventDefault();
            mouseDown = true;

        if(scope.getRotation()){
            wasRotating = true;
            scope.setRotation(false);
        } else {
            wasRotating = false;
        }

        mouseXOnMouseDown = event.clientX - windowHalfX;
        mouseYOnMouseDown = event.clientY - windowHalfY;

        targetXRotationOnMouseDown = targetXRotation;
        targetYRotationOnMouseDown = targetYRotation;
    };

    var onRendererMouseMove = function(event) {
        // log("move");

        if (mouseDown) {
            mouseX = event.clientX - windowHalfX;
            // targetXRotation = targetXRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
            xrot = targetXRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;

            mouseY = event.clientY - windowHalfY;
            // targetYRotation = targetYRotationOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.02;
            yrot = targetYRotationOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.02;

            targetXRotation = xrot;
            targetYRotation = yrot;
        }
    };

    var onRendererMouseUp = function(event) {
        // log("up");
        if (mouseDown) {
            mouseDown = false;

            if (!mouseOver) {
                clearInterval(timer);
                timer = null;
            }

            if (wasRotating) {
                scope.setRotation(true);
            }
        }
    };

    var onRendererMouseOut = function(event) {
        if (!mouseDown) {
            clearInterval(timer);
            timer = null;
        }
        mouseOver = false;
    };

    var onRendererTouchStart = function(event) {
        targetXRotation = object.rotation.z;
        targetYRotation = object.rotation.x;

        timer = setInterval(renderScene, 1000/60);

        if (event.touches.length == 1) {
            event.preventDefault();

            mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
            targetXRotationOnMouseDown = targetXRotation;

            mouseYOnMouseDown = event.touches[0].pageY - windowHalfY;
            targetYRotationOnMouseDown = targetYRotation;
        }
    };

    var onRendererTouchEnd = function(event) {
        clearInterval(timer);
        timer = null;
        // targetXRotation = object.rotation.z;
        // targetYRotation = object.rotation.x;
    };

    var onRendererTouchMove = function(event) {
        if (event.touches.length == 1) {
            event.preventDefault();

            mouseX = event.touches[0].pageX - windowHalfX;
            targetXRotation = targetXRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.05;

            mouseY = event.touches[0].pageY - windowHalfY;
            targetYRotation = targetYRotationOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.05;
        }
    };

    var renderScene = function() {
        if (object) {
            // if (view == 'bottom') {
            //   if (showPlane) {
            //     plane.rotation.z = object.rotation.z -= (targetRotation + object.rotation.z) * 0.05;
            //   } else {
            //     object.rotation.z -= (targetRotation + object.rotation.z) * 0.05;
            //   }
            // } else {
            //   if (showPlane) {
            //     plane.rotation.z = object.rotation.z += (targetRotation - object.rotation.z) * 0.05;
            //   } else {
            //     object.rotation.z += (targetRotation - object.rotation.z) * 0.05;
            //   }
            // }

            if (showPlane) {
                plane.rotation.z = object.rotation.z = (targetXRotation - object.rotation.z) * 0.2;
                plane.rotation.x = object.rotation.x = (targetYRotation - object.rotation.x) * 0.2;
            } else {
                object.rotation.z = (targetXRotation - object.rotation.z) * 0.2;
                object.rotation.x = (targetYRotation - object.rotation.x) * 0.2;
            }

            // log(object.rotation.x);

            camera.updateMatrix();
            object.updateMatrix();

            if (showPlane) {
                plane.updateMatrix();
            }

            renderer.render(scene, camera);
            // stats.update();
        }
    };

    var rotateLoop = function() {
        // targetRotation += 0.01;
        targetXRotation += 0.05;
        renderScene();
    };

    this.getShowPlane = function(){
        return showPlane;
    };

    this.setShowPlane = function(show) {
        showPlane = show;

        if (show) {
            if (scene && !plane) {
                loadPlaneGeometry();
            }
            plane.material[0].opacity = 1;
            // plane.updateMatrix();
        } else {
            if (scene && plane) {
                // alert(plane.material[0].opacity);
                plane.material[0].opacity = 0;
                // plane.updateMatrix();
            }
        }

        renderScene();
    };

    this.getRotation = function() {
        return rotateTimer !== null;
    };

    this.setRotation = function(rotate) {
        rotation = rotate;

        if (rotate) {
            rotateTimer = setInterval(rotateLoop, 1000/60);
        } else {
            clearInterval(rotateTimer);
            rotateTimer = null;
        }

        scope.onSetRotation();
    };

    this.onSetRotation = function(callback) {
        if(callback === undefined){
            if(rotateListener !== null){
                try{
                    rotateListener(scope.getRotation());
                } catch(ignored) {

                }
            }
        } else {
            rotateListener = callback;
        }
    };

    this.setCameraView = function(dir) {
        cameraView = dir;

        targetXRotation = 0;
        targetYRotation = 0;

        if (object) {
            object.rotation.x = 0;
            object.rotation.y = 0;
            object.rotation.z = 0;
        }

        if (showPlane && object) {
            plane.rotation.x = object.rotation.x;
            plane.rotation.y = object.rotation.y;
            plane.rotation.z = object.rotation.z;
        }

        if (dir == 'top') {
            // camera.position.y = 0;
            // camera.position.z = 100;
            // camera.target.position.z = 0;
            if (showPlane) {
                plane.flipSided = false;
            }
        } else if (dir == 'side') {
            //  camera.position.y = -70;
            //  camera.position.z = 70;
            // camera.target.position.z = 0;
            targetYRotation = -4.5;
            if (showPlane) {
                plane.flipSided = false;
            }
        } else if (dir == 'leftside') {
            // camera.position.y = 70;
            // camera.position.z = 70;
            // camera.target.position.z = 0;
            targetYRotation = -4.5;
            if (showPlane) {
                plane.flipSided = false;
            }
        } else if (dir == 'bottom') {
            // camera.position.y = 0;
            // camera.position.z = -100;
            // camera.target.position.z = 0;
            if (showPlane) {
                plane.flipSided = true;
            }
        } else {
           // camera.position.y = -70;
           // camera.position.z = 70;
            // camera.target.position.z = 0;
            if (showPlane) {
                plane.flipSided = false;
            }
        }

        mouseX            = targetXRotation;
        mouseXOnMouseDown = targetXRotation;

        mouseY            = targetYRotation;
        mouseYOnMouseDown = targetYRotation;

        scope.centerCamera();

        renderScene();
    };

    this.setCameraZoom = function(factor) {
        cameraZoom = factor;

        if (cameraView == 'bottom') {
            if (camera.position.z + factor > 0) {
                factor = 0;
            }
        } else {
            if (camera.position.z - factor < 0) {
                factor = 0;
            }
        }

        if (cameraView == 'top') {
            camera.position.z -= factor;
        } else if (cameraView == 'bottom') {
            camera.position.z += factor;
        } else if (cameraView == 'side') {
            camera.position.y += factor;
            camera.position.z -= factor;
        }  else if (cameraView == 'leftside') {
            camera.position.y += factor;
            camera.position.z -= factor;
        } else {
            camera.position.y += factor;
            camera.position.z -= factor;
        }

        renderScene();
    };

    this.getObjectMaterial = function() {
        return objectMaterial;
    };

    this.setObjectMaterial = function(type) {
        objectMaterial = type;
        loadObjectGeometry();
    };

    this.setBackgroundColor = function(color) {
        backgroundColor = color

        if (renderer) {
            renderer.domElement.style.backgroundColor = color;
        }
    };

    this.setObjectColor = function(color) {
        objectColor = parseInt(color.replace(/\#/g, ''), 16);
        loadObjectGeometry();
    };

    this.loadStl = function(url) {
        scope.startLoadModelWorker('loadStl', url);
    };

    this.loadOBJ = function(url) {
        scope.startLoadModelWorker('loadOBJ', url);
    };

    this.loadStlString = function(STLString) {
       scope.startLoadModelWorker('loadStlString', STLString);
    };

    this.loadStlBinary = function(STLBinary) {
        scope.startLoadModelWorker('loadStlBinary', STLBinary);
    };

    this.loadObjString = function(OBJString) {
        scope.startLoadModelWorker('loadObjString', OBJString);
    };

    this.loadJSON = function(url) {
        scope.startLoadModelWorker('loadJSON', url);
    };

    this.loadPLY = function(url) {
        scope.startLoadModelWorker('loadPLY', url);
    };

    this.loadPlyString = function(plyString) {
        scope.startLoadModelWorker('loadPlyString', plyString);
    };

    this.loadPlyBinary = function(plyBinary) {
        scope.startLoadModelWorker('loadPlyBinary', plyBinary);
    };

    this.centerCamera = function() {
        if (geometry) {
            // Using method from http://msdn.microsoft.com/en-us/library/bb197900(v=xnagamestudio.10).aspx
            // log("bounding sphere radius = " + geometry.boundingSphere.radius);

            // look at the center of the object
             var cameraTarget = new THREE.Vector3( geometry.center_x, geometry.center_y, geometry.center_z );
             camera.lookAt(cameraTarget);

            // set camera position to center of sphere
            camera.position.x = geometry.center_x;
            camera.position.y = geometry.center_y;
            camera.position.z = geometry.center_z;

            // find distance to center
            distance = geometry.boundingSphere.radius / Math.sin((camera.fov/2) * (Math.PI / 180));

            // zoom backwards about half that distance, I don't think I'm doing the math or backwards vector calculation correctly?
            // scope.setCameraZoom(-distance/1.8);
            // scope.setCameraZoom(-distance/1.5);
            scope.setCameraZoom(-distance/1.9);

            directionalLight.position.x = geometry.min_y * 2;
            directionalLight.position.y = geometry.min_y * 2;
            directionalLight.position.z = geometry.max_z * 2;

            pointLight.position.x = geometry.center_y;
            pointLight.position.y = geometry.center_y;
            pointLight.position.z = geometry.max_z * 2;
        } else {
            // set to any valid position so it doesn't fail before geometry is available
            camera.position.y = -70;
            camera.position.z = 70;

            camera.lookAt(new THREE.Vector3( -70, 70, 0));
        }
    };

    this.loadArray = function(array) {
        log("loading array...");
        geometry = new StlGeometry(array);
        loadObjectGeometry();
        scope.setRotation(false);
        scope.setRotation(true);
        scope.centerCamera();
        log("finished loading " + geometry.faces.length + " faces.");
    };


    this.startLoadModelWorker = function(cmd, param) {
        scope.setRotation(false);

        var WorkerFacade = require('view/workerfacade').WorkerFacade();
        var worker = new WorkerFacade('./view/loadmodelworker.js');
        workers.push(worker);

        worker.onmessage = function(event) {
            if (event.data.status == "complete") {
                progressBar.innerHTML = 'Initializing geometry...';
                // scene.removeObject(object);
                geometry = new StlGeometry(event.data.content);
                loadObjectGeometry();
                progressBar.innerHTML = '';
                progressBar.style.display = 'none';

                scope.setRotation(false);
                scope.setRotation(true);
                //scope.log("finished loading " + geometry.faces.length + " faces.");
                scope.centerCamera();

            } else if (event.data.status == "complete_points") {
                progressBar.innerHTML = 'Initializing points...';

                geometry = new THREE.Geometry();

                var material = new THREE.ParticleBasicMaterial( { color: 0xff0000, opacity: 1 } );

                // material = new THREE.ParticleBasicMaterial( { size: 35, sizeAttenuation: false} );
                // material.color.setHSV( 1.0, 0.2, 0.8 );

                for (i in event.data.content[0]) {
                    // for (var i=0; i<10; i++) {
                    vector = new THREE.Vector3( event.data.content[0][i][0], event.data.content[0][i][1], event.data.content[0][i][2] );
                    geometry.vertices.push(vector);
                }

                particles = new THREE.ParticleSystem( geometry, material );
                particles.sortParticles = true;
                particles.updateMatrix();
                scene.add( particles );

                camera.updateMatrix();
                renderer.render(scene, camera);

                progressBar.innerHTML = '';
                progressBar.style.display = 'none';

                scope.setRotation(false);
                scope.setRotation(true);
                log("finished loading " + event.data.content[0].length + " points.");
                // scope.centerCamera();
            } else if (event.data.status == "progress") {
                progressBar.style.display = 'block';
                progressBar.style.width = event.data.content;
                // scope.log(event.data.content);
            } else if (event.data.status == "message") {
                progressBar.style.display = 'block';
                progressBar.innerHTML = event.data.content;
                log(event.data.content);
            } else if (event.data.status == "alert") {
                scope.displayAlert(event.data.content);
            } else if (event.data.status == "loadReady") {

                this.postMessage({'cmd':cmd, 'param':param});

            } else {
                alert('Error: ' + event.data);
                scope.log('Unknown Worker Message: ' + event.data);
            }
        };

        worker.onerror = function(error) {
            log(error);
            error.preventDefault();
        };
    };

    this.displayAlert = function(msg) {
        msg = msg +
        "<br/><br/><center><input type=\"button\" value=\"Ok\" onclick=\"document.getElementById('alertBox').style.display='none'\"></center>";

        alertBox.innerHTML = msg;
        alertBox.style.display = 'block';

        // log(msg);
    };

    function loadPlaneGeometry() {
        // TODO: switch to lines instead of the Plane object so we can get rid of the horizontal lines in canvas renderer...
        var PlaneModule = require("view/plane");
        plane = new THREE.Mesh(new PlaneModule.Plane(100, 100, 10, 10), new THREE.MeshBasicMaterial({color:0xafafaf,wireframe:true}));
        scene.add(plane);
    }

    function loadObjectGeometry() {
        if (scene && geometry) {
            if (objectMaterial == 'wireframe') {
                // material = new THREE.MeshColorStrokeMaterial(objectColor, 1, 1);
                material = new THREE.MeshBasicMaterial({color:objectColor,wireframe:true});
            } else {
              if (useWebGl) {
                // material = new THREE.MeshPhongMaterial(objectColor, objectColor, 0xffffff, 50, 1.0);
                // material = new THREE.MeshColorFillMaterial(objectColor);
                // material = new THREE.MeshLambertMaterial({color:objectColor});
                material = new THREE.MeshLambertMaterial({color:objectColor, shading: THREE.FlatShading});
            } else {
                // material = new THREE.MeshColorFillMaterial(objectColor);
                material = new THREE.MeshLambertMaterial({color:objectColor, shading: THREE.FlatShading});
            }
            }

            // scene.removeObject(object);

            if (object) {
                // shouldn't be needed, but this fixes a bug with webgl not removing previous object when loading a new one dynamically
                object.materials = [new THREE.MeshBasicMaterial({color:0xffffff, opacity:0})];
                scene.remove(object);
                // object.geometry = geometry;
                // object.materials = [material];
            }

            object = new THREE.Mesh(geometry, material);
            scene.add(object);

            if (objectMaterial != 'wireframe') {
                object.overdraw = true;
                object.doubleSided = true;
            }

            object.updateMatrix();

            targetXRotation = 0;
            targetYRotation = 0;

            renderScene();
        }
    }

};

// Exports Symbols
exports.SceneView = SceneView;

});


