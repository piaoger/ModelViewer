
/**
* bootloader is a common module to load Node.js Application
* by Fire up npm and run the command by using NPM Programmatically
*/

(function () {
"use strict";

var child_process = require('child_process');

/**
* Check if it's still in staging.
*/
function _inStaging() {
    return process.env.NODE_ENV == 'development';
}

/**
* Spawn a new child process to start the application
* It pass results back through this process.
* @param {String[]} args Array List of string arguments
* @param (Object) options Object used for options.
*/
function _run(args, options) {

    var child = child_process.spawn('node', args, options);
    console.log('Spawned child pid: ' + child.pid);

    child.stdout.on('data', function(data ) {
        console.log('std.out: ' + data);
    });

    child.stderr.on('data', function(data ) {
        console.error('std.err: ' + data);
    });

    // This event is emitted when the stdio streams of a child process have all terminated.
    // This is distinct from 'exit', since multiple processes might share the same stdio streams.
    child.on('close', function (code, signal) {
      console.log('Child process closed with code ' + code + ' due to receipt of signal '+ signal);
    });

    // This event is emitted after the child process ends.
    // If the process terminated normally, code is the final exit code of the process, otherwise null.
    // If the process terminated due to receipt of a signal, signal is the string name of the signal, otherwise null.
    child.on('exit', function(code, signal) {
        console.log('Child process terminated with code ' + code + ' due to receipt of signal '+ signal);
        if (code) {
            // Wait before the current process is ready to exit
            // before setting the exit code (otherwise, all the console
            // output doesn't make it)
            process.on('exit', function() {
                process.exit(code);
            });
        }
    });
}


/**
* Enable restartable service programmatically by using forever-monitor
* You can get more information from bellow pages:
*    https://npmjs.org/package/forever-monitor
*    https://github.com/nodejitsu/forever-monitor
* @param {string} The script to run.
*/
function _runRestartable(runner) {

    var forever = require('forever-monitor');

    var monitor = new (forever.Monitor)(runner, {
                    max: 36,
                    silent: true,
                    options: []
            });

    monitor.on('restart', function () {
        console.log("Restart application");
    });

    monitor.on('exit', function() {
        console.log('Monitor has exited after ' + monitor.max + ' restarts');
    });

    monitor.on('error', function(err) {
        console.log('Error ');
    });

    monitor.on('stdout', function(data ) {
        console.log('std.out: ' + data);
    });

    monitor.on('stderr', function(data ) {
        console.error('std.err: ' + data);
    });

    monitor.start();
}


/**
* Node Application is booted in different ways.
* The Node Application is restartable for long running in non-staging environment.
* @param {string} The JavaScript file to run.
*/
function _startRunner(runner) {

    if (_inStaging()) {
        var args    = [],
            options = { cwd: undefined,
                        env: process.env
                };

        // TODO(Piaoger): Debugging.
        // Use --debug or --debug-brk
        // default debugport is 5858.
        args.push("--debug-brk");

        args.push(runner);
        _run(args, options);
    } else {
        _runRestartable(runner);
    }
}


/**
* Loading an Application at Boot up.
*/
function _bootup() {

    switch (process.env.npm_lifecycle_event) {

        case 'start':
            var runner = 'server.js';
            _startRunner(runner);
            break;

        default:
            console.error('Unknown configuration!!!!!');
            break;
    }
}


// It's time to Boot!!
!function(){
    _bootup();
}();

}());
