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

var vertx = require('../index.js');

var eventbus = new vertx.EventBus('http://localhost:8080/eventbus');

eventbus.onopen = function() {
  console.log('eventbus.onopen start.');
  eventbus.registerHandler('my-handler', function(message) {
		 console.log("Got message: " + JSON.stringify(message));
		 
  });
  
  console.log("status: " + eventbus.status());

  eventbus.send('my-address', {'action': 'go', 'message': 'Hello World!'}, function(reply) {
    console.log("receive message: " + JSON.stringify(reply));
  });
};
