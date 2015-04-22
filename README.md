vertx-eventbus
==============

Manages the vert.x SockJS event bus bridge. This is a light version that has minimal dependencies. There is an existing vert.x eventbus bridge client node module:

https://github.com/muraken720/vertx-eventbus-client

However, that module was dependent on some unnecessary module (JSDOM) and another sockJS module that required a C++ compiler during installation (ws and thus contextify). Some of these modules were not compatible with the latest version of node (> 0.10) and thus would not install locally on Windows machines and the occassional Macbook pro.

Thus, I re-wrote the module to utilize another sockjs module:

https://github.com/humanchimp/node-sockjs-client

###API



###TEST

####Server side test code
You need an installation of vertx.io on you're local machine to start the server side test code.

vertx run test/Server.java

####Client side test code
You need node installed on you're local machine to run the client side test code.

node test/node-client.js

