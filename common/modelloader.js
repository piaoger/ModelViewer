
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function (require, exports, module) {
"use strict";


var _workerFacadeMessageHandler = null;

function setWorkerFacadeMessage(handler) {
    _workerFacadeMessageHandler = handler;
};

function postWorkerFacadeMessage(data) {
    if(_workerFacadeMessageHandler) {
        _workerFacadeMessageHandler(data)
    }
};

function ModelLoader(event) {

    // Code from https://developer.mozilla.org/En/Using_XMLHttpRequest#Receiving_binary_data
    this.loadBinaryResouce = function(url) {
        var req = new XMLHttpRequest();
        req.open('GET', url, false);
        // The following line says we want to receive data as Binary and not as Unicode
        req.overrideMimeType('text/plain; charset=x-user-defined');
        req.send(null);
        if (req.status != 200) {
            return '';
        }

        return req.responseText;
    };

    this.loadSTL = function(url) {
        var looksLikeStlBinary = function(reader) {
            // STL files don't specify a way to distinguish ASCII from binary.
            // The usual way is checking for "solid" at the start of the file --
            // but Thingiverse has seen at least one binary STL file in the wild
            // that breaks this.

            // The approach here is different: binary STL files contain a triangle
            // count early in the file.  If this correctly predicts the file's length,
            // it is most probably a binary STL file.

            reader.seek(80);  // skip the header
            var count = reader.readUInt32();

            var predictedSize = 80 /* header */ + 4 /* count */ + 50 * count;
            return reader.getSize() == predictedSize;
        };

        postWorkerFacadeMessage({'status':'message', 'content':'Downloading ' + url});
        var file = this.loadBinaryResouce(url);

        var BinaryReader = require("./binaryreader").BinaryReader;
        var reader = new BinaryReader(file);

        if (looksLikeStlBinary(reader)) {
            this.loadStlBinary(reader);
        } else {
            this.loadStlString(file);
        }
    } ;

    this.loadOBJ = function(url) {
        postWorkerFacadeMessage({'status':'message', 'content':'Downloading ' + url});
        var file = this.loadBinaryResouce(url);
        this.loadObjString(file);
    };

    this.loadJSON = function(url) {
        postWorkerFacadeMessage({'status':'message', 'content':'Downloading ' + url});
        var file = this.loadBinaryResouce(url);
        this.loadJSONString(file);
    };

    this.loadPLY = function(url) {
        postWorkerFacadeMessage({'status':'message', 'content':'Downloading ' + url});

        var file = this.loadBinaryResouce(url);

        if (file.match(/format ascii/i)) {
            this.loadPlyString(file);
        } else {
            this.loadPlyBinary(file);
        }
    };

    this.loadStlString = function(stlString) {
        postWorkerFacadeMessage({'status':'message', 'content':'Parsing STL String...'});
        postWorkerFacadeMessage({'status':'complete', 'content':this.parseStlString(stlString)});
    };

    this.loadStlBinary = function(stlBinary) {
        postWorkerFacadeMessage({'status':'message', 'content':'Parsing STL Binary...'});
        postWorkerFacadeMessage({'status':'complete', 'content':this.parseStlBinary(stlBinary)});
    };

    this.loadObjString = function(objString) {
        postWorkerFacadeMessage({'status':'message', 'content':'Parsing OBJ String...'});
        postWorkerFacadeMessage({'status':'complete', 'content':this.parseObjString(objString)});
    };

    this.loadJSONString = function(jsonString) {
        postWorkerFacadeMessage({'status':'message', 'content':'Parsing JSON String...'});
        postWorkerFacadeMessage({'status':'complete', 'content':eval(jsonString)});
    };

    this.loadPlyString = function(plyString) {
        postWorkerFacadeMessage({'status':'message', 'content':'Parsing PLY String...'});
        postWorkerFacadeMessage({'status':'complete_points', 'content':this.parsePlyString(plyString)});
    };

    this.loadPlyBinary = function(plyBinary) {
        postWorkerFacadeMessage({'status':'message', 'content':'Parsing PLY Binary...'});
        postWorkerFacadeMessage({'status':'complete_points', 'content':this.parsePlyBinary(plyBinary)});
    };

    this.parsePlyString = function(plyString) {
        var properties = [];
        var vertices = [];
        var colors = [];

        var vertex_count = 0;

        var header = /ply\n([\s\S]+)\nend_header/ig.exec(plyString)[1];
        var data = /end_header\n([\s\S]+)$/ig.exec(plyString)[1];

        // postWorkerFacadeMessage({'status':'message', 'content':'header:\n' + header});
        // postWorkerFacadeMessage({'status':'message', 'content':'data:\n' + data});

        header_parts = header.split("\n");

        for (i in header_parts) {
            if (/element vertex/i.test(header_parts[i])) {
                vertex_count = /element vertex (\d+)/i.exec(header_parts[i])[1];
            } else if (/property/i.test(header_parts[i])) {
                properties.push(/property (.*) (.*)/i.exec(header_parts[i])[2]);
            }
        }

        // postWorkerFacadeMessage({'status':'message', 'content':'properties: ' + properties});

        data_parts = data.split("\n");

        for (i in data_parts) {
            data_line = data_parts[i];
            data_line_parts = data_line.split(" ");

            vertices.push([
                parseFloat(data_line_parts[properties.indexOf("x")]),
                parseFloat(data_line_parts[properties.indexOf("y")]),
                parseFloat(data_line_parts[properties.indexOf("z")])
            ]);

            colors.push([
                parseInt(data_line_parts[properties.indexOf("red")]),
                parseInt(data_line_parts[properties.indexOf("green")]),
                parseInt(data_line_parts[properties.indexOf("blue")])
            ]);
        }

        // postWorkerFacadeMessage({'status':'message', 'content':'vertices: ' + vertices});

        return [vertices, colors];
    };

    this.parsePlyBinary = function(plyBinary) {
        return false;
    };

    this.parseStlBinary = function(stlBinary) {
        // Skip the header.
        stlBinary.seek(80);

        // Load the number of vertices.
        var count = stlBinary.readUInt32();

        // During the parse loop we maintain the following data structures:
        var vertices = [];   // Append-only list of all unique vertices.
        var vert_hash = {};  // Mapping from vertex to index in 'vertices', above.
        var faces    = [];   // List of triangle descriptions, each a three-element
                             // list of indices in 'vertices', above.

        for (var i = 0; i < count; i++) {
            if (i % 100 == 0) {
            postWorkerFacadeMessage({
                    'status':'message',
                    'content':'Parsing ' + (i+1) + ' of ' + count + ' polygons...'
                });
            postWorkerFacadeMessage({
                    'status':'progress',
                    'content':parseInt(i / count * 100) + '%'
              });
            }

            // Skip the normal (3 single-precision floats)
            stlBinary.seek(stlBinary.getPosition() + 12);

            var face_indices = [];
            for (var x = 0; x < 3; x++) {
                var vertex = [stlBinary.readFloat(), stlBinary.readFloat(), stlBinary.readFloat()];

                var vertexIndex = vert_hash[vertex];
                if (vertexIndex == null) {
                    vertexIndex = vertices.length;
                    vertices.push(vertex);
                    vert_hash[vertex] = vertexIndex;
                }

                face_indices.push(vertexIndex);
            }
            faces.push(face_indices);

            // Skip the "attribute" field (unused in common models)
            stlBinary.readUInt16();
        }

        return [vertices, faces];
    };

    // build stl's vertex and face arrays
    this.parseStlString = function(stlString) {
        var vertexes  = [];
        var faces     = [];

        var face_vertexes = [];
        var vert_hash = {}

        // console.log(stlString);

        // strip out extraneous stuff
        stlString = stlString.replace(/\r/, "\n");
        stlString = stlString.replace(/^\s*solid[^\n]*/, "");
        stlString = stlString.replace(/\n/g, " ");
        stlString = stlString.replace(/facet normal /g,"");
        stlString = stlString.replace(/outer loop/g,"");
        stlString = stlString.replace(/vertex /g,"");
        stlString = stlString.replace(/endloop/g,"");
        stlString = stlString.replace(/endfacet/g,"");
        stlString = stlString.replace(/endsolid[^\n]*/, "");
        stlString = stlString.replace(/\s+/g, " ");
        stlString = stlString.replace(/^\s+/, "");

        postWorkerFacadeMessage({'status':'message', 'content':stlString});

        var facet_count = 0;
        var block_start = 0;

        var points = stlString.split(" ");

        postWorkerFacadeMessage({'status':'message', 'content':'Parsing vertices...'});
        for (var i=0; i<points.length/12-1; i++) {
            if ((i % 100) == 0) {
                postWorkerFacadeMessage({'status':'progress', 'content':parseInt(i / (points.length/12-1) * 100) + '%'});
            }

            var face_indices = [];
            for (var x=0; x<3; x++) {
                var vertex = [parseFloat(points[block_start+x*3+3]), parseFloat(points[block_start+x*3+4]), parseFloat(points[block_start+x*3+5])];

                var vertexIndex = vert_hash[vertex];
                if (vertexIndex == null) {
                  vertexIndex = vertexes.length;
                  vertexes.push(vertex);
                  vert_hash[vertex] = vertexIndex;
                }

                face_indices.push(vertexIndex);
            }
            faces.push(face_indices);

            block_start = block_start + 12;
        }

        return [vertexes, faces];
    };

    this.parseObjString = function(objString) {
        var vertexes = [];
        var faces    = [];

        var lines = objString.split("\n");

        // var normal_position = 0;

        for (var i=0; i<lines.length; i++) {
            postWorkerFacadeMessage({'status':'progress', 'content':parseInt(i / lines.length * 100) + '%'});

            line_parts = lines[i].replace(/\s+/g, " ").split(" ");

            if (line_parts[0] == "v") {
                vertexes.push([parseFloat(line_parts[1]), parseFloat(line_parts[2]), parseFloat(line_parts[3])]);
            } else if (line_parts[0] == "f") {
                faces.push([parseFloat(line_parts[1].split("/")[0])-1, parseFloat(line_parts[2].split("/")[0])-1, parseFloat(line_parts[3].split("/")[0]-1), 0])
            }
        }

        return [vertexes, faces];
    };


    // load model based on input event
    var eventParam = event.data.param;
    switch(event.data.cmd) {

    case "loadSTL":
      this.loadSTL(eventParam);
      break;

    case "loadStlString":
      this.loadStlString(eventParam);
      break;

    case "loadStlBinary":
      this.loadStlBinary(eventParam);
      break;

    case "loadOBJ":
      this.loadOBJ(eventParam);
      break;

    case "loadObjString":
      this.loadObjString(eventParam);
      break;

    case "loadJSON":
      this.loadJSON(eventParam);
      break;

    case "loadPLY":
      this.loadPLY(eventParam);
      break;

    case "loadPlyString":
      this.loadPlyString(eventParam);
      break;

    case "loadPlyBinary":
      this.loadPlyBinary(eventParam);
      break;
    }

};

// Exports Symbols
exports.ModelLoader = ModelLoader;
exports.setWorkerFacadeMessage = setWorkerFacadeMessage;

});