vertx-eventbus
==============

This is a Node.js Module that manages the vert.x SockJS event bus bridge for a node application. This is a lightweight version that has minimal dependencies. Based of an existing open source vert.x eventbus bridge client node module:

https://github.com/muraken720/vertx-eventbus-client

However, that module was dependent on some unnecessary modules (JSDOM) and another sockJS module that required a C++ compiler during installation (ws and thus contextify). Some of these modules were not compatible with the latest version of node (> 0.10) and thus would not install locally on Windows machines and on the occassional Macbook pro. Developers were wasting too much time configuring their individual development machine to build and debug a node application and were forced to use a VM running linux.

Thus, I re-wrote the module to utilize another sockjs module:

https://github.com/humanchimp/node-sockjs-client

This reduced the dependency modules without losing any functionality. I did re-name a few things (i.e. CONNECTED instead of OPEN).

###Installation

Its a node module so refer to the latest node documentation for installation. You could simply add the following to you're package.json:

```json
  "dependencies": {
    "vertx-eventbus" : "git+https://github.research.att.com/pdragosh/vertx-eventbus"
```

###Initialization

Create an instance of the event bus:

```
var vertx = require('vertx-eventbus');
var eventbus = new vertx.EventBus('http://localhost:8080/eventbus');
```

###API

####send

```
send(address, message, replyHandler)
```
address - vert.x event bus address you want the message to be sent to
message - the message itself.
replyHandler (optional) - an optional reply handler to call with the message reply

####publish

```
publish(address, message)
```

address - vert.x event bus address you want the message to be published to
message - the message itself.

####registerHandler

```
registerHandler(address, handler)
```

Register's a handler for a specific address.

address - the vert.x event bus address you want to receive messages
handler - the handler that is called when a message is sent or published to you're address

####unregisterHandler

```
unregisterHandler(address, handler)
```

UNRegister's a handler for a specific address.

address - the vert.x event bus address that was registered to receive messages
handler - the associated handler that was registered with

####status

```
status()
```

Returns the current status of the connection:

CONNECTING
CONNECTED
CLOSING
CLOSED

###Callbacks

####onopen

This is called when SockJS has successfully connected to the vert.x eventbus bridge.

####onclose

This is called when SockJS has closed the connection to the vert.x eventbus bridge. Expect this to happen even with ping'ing occuring.

###TEST

####Server side test code
You need an installation of vertx.io on you're local machine to start the server side test code.

vertx run test/Server.java

####Client side test code
You need node.js installed on you're local machine to run the client side test code.

node test/node-client.js

