/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 
var hamrahpay =
{
	pay_request_address : 'https://hamrahpay.com/rest-api/pay-request',
	verify_address :'https://hamrahpay.com/rest-api/verify-payment',
	payment_address : 'https://hamrahpay.com/cart/app/pay_v2/',
	verification_type :'device_verification',
	PayRequest: function(prd_sku,device_id)
	{
		$.ajax({
			type: "POST",
			method: "POST",
			url: pay_request_address,
			
			// Tell jQuery we're expecting JSONP
			dataType: "jsonp",
			// Tell YQL what we want and that we want JSON
			data: {
				sku: prd_sku,
				device_id: device_id,
				verification_type:verification_type
			},
			// Work with the response
			success: function( response ) {
				console.log( response ); // server response
			}
		}).fail(function(data) {
				console.log( data );
		});
		console.log('payment requested');
		alert(device_id);
	}
};
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        //this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();