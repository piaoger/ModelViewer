
(function () {
"use strict";

var npm = require('npm');

function _startWebServer() {

    var express = require('express'),
        gzippo  = require('gzippo'),
        fs      = require('fs');

    /*
        An example on how to configure express web server

            app.set('views', __dirname + '/views');
            app.engine('html', require('ejs').renderFile);

        Or

            app.set("view options", {layout: false});
            app.use(express.static(__dirname + '/public'));

        Final code would look like this.

            var express = require("express"),
                fs      = require('fs'),
                sys     = require('sys');

            var app = express.createServer();

            app.use(express.logger());
            app.set("view options", {layout: false});
            app.use(express.static(__dirname + '/views'));

            app.get('/', function(req, res){
                res.render('/views/index.html');
            });

            app.listen(8080);
    */

    // Create Http Server Object with express.
    var app = express.createServer();

    // Set up the HTTP Service
    app.configure(function() {
        app.use(express.cookieParser());
        app.use(express.bodyParser());
        app.use(express.methodOverride());


        // If router is used, please remember to privede correct page path
        // Correct:
        //     res.redirect('/index.html');
        //     res.redirect(req.url + 'index.html');
        // Incorrect:
        //     res.redirect ('index.html');
        app.use(app.router);
       // app.set('view engine', 'jade');
       // app.set('views', __dirname + '/views');
        //app.set("view options", {layout: false});
        //app.use(express.static(__dirname + '/../www'));

        app.use(gzippo.staticGzip(__dirname + '/../www'));

        // Url Routing
        !function(app ) {

            // Root URI
            app.get('/', function(req, res) {

            	// req/url == '/'
                res.redirect('/index.html');
            });

            // Heartbeat
            app.get('/pulse', function(req, res ) {
                res.send('Heartbeat');
            });

            // // Api
            // app.get('/api', function(req, res ) {
            //     res.send('Web Service Api');
            // });

        } (app);
    });

    app.configure('development', function() {
        app.use(express.errorHandler({ 'dump': true }));
    });

    app.configure('production', function() {
        app.use(express.errorHandler());
    });

    // GET request
    var startRouter = function(path){
        app.get(route, function(req,res){
            //console.log("Connect to "+path);
            //var page = info[routes[path].data];
            //res.render(routes[path].template, page);
            res.render(routes[path].template);
        });
    };

    var routes = JSON.parse(fs.readFileSync('router.json','utf8'));
    for(var route in routes){
       startRouter(route);
    }

    // Start the HTTP Server
    app.listen(9000, function(err) {
        if (err) {
            console.log('Starting Http Server failed.');
            return;
        }

        console.log('Express server is listening on port %d in %s mode', app.address().port, app.settings.env);
    });
}


/**
* Start up application.
*   WebServer is setup and started automatically.
*/
function _startup() {
    var utils = require('utils.js');
    console.log(utils.getSomething());
    _startWebServer();
}


!function(){
    // Fire up npm and run the command by using NPM Programmatically
    // How to Handling NPM scripts which are configured in package.json
    // [NPM Scripts] (https://npmjs.org/doc/scripts.html)
    npm.load({}, function() {
        npm.commands.install(_startup);
    });
}();


}());

