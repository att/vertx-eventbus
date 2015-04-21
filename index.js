/*
 *                        AT&T - PROPRIETARY
 *          THIS FILE CONTAINS PROPRIETARY INFORMATION OF
 *        AT&T AND IS NOT TO BE DISCLOSED OR USED EXCEPT IN
 *             ACCORDANCE WITH APPLICABLE AGREEMENTS.
 *
 *          Copyright (c) 2015 AT&T Knowledge Ventures
 *              Unpublished and Not for Publication
 *                     All Rights Reserved
 */
'use strict';
//
// Libs we need
//
var uuid = require('node-uuid');
var sockJS = require('node-sockjs-client');
//
// Constants that determine our status
//
var CONNECTING = 0;
var CONNECTED = 1;
var CLOSING = 2;
var CLOSED = 3;

module.exports = {
		
		EventBus: function(url, options) {
			//
			// Save our pointer
			//
			var that = this;
			//
			// setup our constants
			//
			that.CONNECTING = CONNECTING;
			that.CONNECTED = CONNECTED;
			that.CLOSING = CLOSING;
			that.CLOSED = CLOSED;
			//
			// Our variables
			//
		    var handlerMap = {};
		    var replyHandlers = {};
		    var status = CONNECTING;
		    var session = null;
		    var timerID = null;
		    var interval = null;
		    var reconnect = null;
		    //
		    // Check the user options
		    //
		    if (options) {
		    	interval = options['eventbus_ping_interval'];
		    	reconnect = options['reconnect'];
		    }
		    if (!interval) {
		    	interval = 5000;
		    }
		    if (!reconnect) {
		    	reconnect = false;
		    }
		    //
		    // Connect to vertx event bus bridge
		    //
		    var sockJSConn = new sockJS(url, undefined, options);
		    //
		    // Our callers can set these
		    //
		    that.onopen = null;
		    that.onclose = null;
		    //
		    // Functions available
		    //
		    that.send = function(address, message, replyHandler) {
		        sendOrPub("send", address, message, replyHandler)
		    }
		    
		    that.publish = function(address, message) {
		        sendOrPub("publish", address, message, null)
		    }
		    
		    that.registerHandler = function(address, handler) {
		    	console.log("registerHandler");
		    	
		    	isConnected();
		    	
		    	var handlers = handlerMap[address];
		        if (!handlers) {
		          handlers = [handler];
		          handlerMap[address] = handlers;
		          var msg = { type : "register",
		                      address: address };
		          sockJSConn.send(JSON.stringify(msg));
		        } else {
		          handlers[handlers.length] = handler;
		        }
		    }
		    
		    that.unregisterHandler = function(address, handler) {
		    	console.log("unregisterHandler");
		    	
		    	isConnected();
		    	
		        var handlers = handlerMap[address];
		        if (handlers) {
		          var idx = handlers.indexOf(handler);
		          if (idx != -1) {
		        	  handlers.splice(idx, 1);
		          }
		          if (handlers.length == 0) {
		            var msg = { type : "unregister",
		                        address: address};
		            sockJSConn.send(JSON.stringify(msg));
		            delete handlerMap[address];
		          }
		        }
		    }
		    
		    that.status = function() {
		    	return status;
		    }
		    //
		    // our sockJS handlers
		    //
		    sockJSConn.onopen = function() {
		    	console.log("sockJS onopen");
		    	//
		    	// Start pinging
		    	//
		    	pingServer();
		    	timerID = setInterval(pingServer, interval);
		    	//
		    	// Set ourselves as connected
		    	//
		    	status = CONNECTED;
		    	//
		    	// Callback if requested
		    	//
		    	if (that.onopen) {
		    		that.onopen();
		    	}
		    }
		    
		    sockJSConn.onclose = function() {
		    	console.log("sockJS onclose");
		    	//
		    	// We are closed
		    	//
		    	status = CLOSED;
		    	//
		    	// Turn off ping
		    	//
		    	if (timerID) {
		    		clearInterval(timerID);
		    		timerID = null;
		    	}
		    	//
		    	// Callback if requested
		    	//
		    	if (that.onclose) {
		    		that.onclose();
		    	}
		    }
		    
		    sockJSConn.onmessage = function(e) {
		    	console.log("sockJS onmessage: " + e);
		    	
		        var msg = e.data;
		        var json = JSON.parse(msg);
		        var body = json.body;
		        var replyAddress = json.replyAddress;
		        var address = json.address;
		        var replyHandler;
		        if (replyAddress) {
		          replyHandler = function(reply, replyHandler) {
		            // Send back reply
		            that.send(replyAddress, reply, replyHandler);
		          };
		        }
		        var handlers = handlerMap[address];
		        if (handlers) {
		          // We make a copy since the handler might get unregistered from within the
		          // handler itself, which would screw up our iteration
		          var copy = handlers.slice(0);
		          for (var i  = 0; i < copy.length; i++) {
		            copy[i](body, replyHandler);
		          }
		        } else {
		          // Might be a reply message
		          var handler = replyHandlers[address];
		          if (handler) {
		            delete replyHandlers[address];
		            handler(body, replyHandler);
		          }
		        }
		    }
		    
		    function pingServer() {
		    	sockJSConn.send(JSON.stringify({type : "ping"}));
		    }
		    
		    function sendOrPub(sendOrPub, address, message, replyHandler) {
//		        checkSpecified("address", 'string', address);
//		        checkSpecified("replyHandler", 'function', replyHandler, true);
		    	
		    	isConnected();
		    	//
		    	// Create an envelope to send the message
		    	//
		        var envelope = { type : sendOrPub,
		                         address: address,
		                         body: message };
		        if (that.sessionID) {
		          envelope.sessionID = that.sessionID;
		        }
		        if (replyHandler) {
		          var replyAddress = uuid.v4();
		          envelope.replyAddress = replyAddress;
		          replyHandlers[replyAddress] = replyHandler;
		        }
		        var str = JSON.stringify(envelope);
		        sockJSConn.send(str);
		   }
		    
		    function isConnected() {
		    	if (status != CONNECTED) {
		    		throw new Error('NOT Connected: ' + status);
		    	}
		    }
	}
	
};
