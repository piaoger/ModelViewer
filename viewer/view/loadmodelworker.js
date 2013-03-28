

// It's also an good example about How to build web Weker with require.js

importScripts('../3rd/require.js');


require(

    { baseUrl: "./"},

    ["../../common/modelloader"],

    function(modelloader) {

        'use strict';

        if (typeof(window) === "undefined") {

            if(modelloader) {

                modelloader.setWorkerFacadeMessage(postMessage);

                onmessage = function(event)    {
                    modelloader.ModelLoader(event);
                };

                // Tells host that this worker is initialized successfully.
                // It's ready for loading model now.
                postMessage({'status':'loadReady', 'content':'This worker is initialized successfully'});
            }
        }
    }
);