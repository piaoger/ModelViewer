

define(function (require, exports, module) {
"use strict";

/**
 * @author mr.doob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
*/
function Plane ( width, height, segments_width, segments_height ) {

    THREE.Geometry.call( this );

    var ix,
        iy,
        width_half    = width / 2,
        height_half   = height / 2,
        gridX         = segments_width || 1,
        gridY         = segments_height || 1,
        gridX1        = gridX + 1,
        gridY1        = gridY + 1,
        segmentWidth  = width / gridX,
        segmentHeight = height / gridY;

    for( iy = 0; iy < gridY1; iy++ ) {

        for( ix = 0; ix < gridX1; ix++ ) {

            var x = ix * segmentWidth - width_half,
                y = iy * segmentHeight - height_half;

            this.vertices.push( new THREE.Vertex( new THREE.Vector3( x, - y, 0 ) ) );
        }

    }

    for( iy = 0; iy < gridY; iy++ ) {

        for( ix = 0; ix < gridX; ix++ ) {

            var a = ix + gridX1 * iy,
                b = ix + gridX1 * ( iy + 1 ),
                c = ( ix + 1 ) + gridX1 * ( iy + 1 ),
                d = ( ix + 1 ) + gridX1 * iy;

            this.faces.push( new THREE.Face4( a, b, c, d ) );
            this.uvs.push( [
                        new THREE.UV( ix / gridX, iy / gridY ),
                        new THREE.UV( ix / gridX, ( iy + 1 ) / gridY ),
                        new THREE.UV( ( ix + 1 ) / gridX, ( iy + 1 ) / gridY ),
                        new THREE.UV( ( ix + 1 ) / gridX, iy / gridY )
                    ]);

        }

    }

    this.computeCentroids();
    this.computeFaceNormals();
    this.sortFacesByMaterial();
}

Plane.prototype = new THREE.Geometry();
Plane.prototype.constructor = Plane;

// Exports Symbols
exports.Plane = Plane;

});
