

define(function(require, exports, module) {
"use strict";

function StlGeometry(stlArray) {

    THREE.Geometry.call(this);

    var log = require('../../common/log').log;

    var scope = this;

    for (var i=0; i<stlArray[0].length; i++) {
        v(stlArray[0][i][0], stlArray[0][i][1], stlArray[0][i][2]);
    }

    for (var i=0; i<stlArray[1].length; i++) {
        f3(stlArray[1][i][0], stlArray[1][i][1], stlArray[1][i][2]);
    }

    function v(x, y, z) {
        scope.vertices.push( new THREE.Vector3( x, y, z )  );
    }

    function f3(a, b, c) {
        scope.faces.push( new THREE.Face3( a, b, c ) );
    }

    this.computeCentroids();
    this.computeFaceNormals();
    this.computeBoundingSphere();

    scope.min_x = 0;
    scope.min_y = 0;
    scope.min_z = 0;

    scope.max_x = 0;
    scope.max_y = 0;
    scope.max_z = 0;

    for (var v = 0, vl = scope.vertices.length; v < vl; v ++) {
        scope.max_x = Math.max(scope.max_x, scope.vertices[v].x);
        scope.max_y = Math.max(scope.max_y, scope.vertices[v].y);
        scope.max_z = Math.max(scope.max_z, scope.vertices[v].z);

        scope.min_x = Math.min(scope.min_x, scope.vertices[v].x);
        scope.min_y = Math.min(scope.min_y, scope.vertices[v].y);
        scope.min_z = Math.min(scope.min_z, scope.vertices[v].z);
    }

    scope.center_x = (scope.max_x + scope.min_x)/2;
    scope.center_y = (scope.max_y + scope.min_y)/2;
    scope.center_z = (scope.max_z + scope.min_z)/2;
}

StlGeometry.prototype = new THREE.Geometry();
StlGeometry.prototype.constructor = StlGeometry;

// Exports Symbols
exports.StlGeometry = StlGeometry;


});