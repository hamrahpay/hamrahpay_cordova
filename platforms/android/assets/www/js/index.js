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
	pay_code :'',
	device_id : '',
	product_sku:'',
	CheckInternetConnection: function()
	{
		var networkState = navigator.connection.type;
		console.log(networkState);
		if (networkState == Connection.NONE || networkState =='none' || networkState == Connection.UNKNOWN)
			return 'offline';
		else
			return 'online';
			
	},
	PayRequest: function(prd_sku,device_id)
	{
		hamrahpay.product_sku = prd_sku;
		hamrahpay.device_id = device_id;
		if (hamrahpay.CheckInternetConnection()=='online')
		{
			$.ajax({
				type: "POST",
				method: "POST",
				url: this.pay_request_address,
				data: {
					sku: prd_sku,
					device_id: device_id,
					verification_type:this.verification_type
				},
				// Work with the response
				success: function( response ) {
					if (response.status==false)
					{
						if (response.status=="READY_TO_PAY")
						{
							hamrahpay.pay_code = response.pay_code;
							hamrahpay.ShowPaymentPage(response.pay_code);
						}
						else if (response.status=='BEFORE_PAID')
						{
							hamrahpay.Activation(hamrahpay.product_sku);
						}
						else
						{
							console.log(response);
						}
					}
					else
					{
						alert(response.message);
					}
				}
			}).fail(function(data) {
					hamrahpay.pay_code='';
					//console.log( data );
					alert('خطایی در ارتباط با سرور پیش آمده است . لطفا مجدد تلاش نمایید.');
			});
		}
		else
		{
			alert('لطفا ابتدا به اینترنت متصل شوید و مجددا تلاش بفرمایید.');
		}
		//console.log('payment requested');
		//alert(device_id);
	},
	ShowPaymentPage: function(pay_code)
	{
		var payment_link = this.payment_address+pay_code;
		var ref = cordova.InAppBrowser.open(payment_link, '_blank', 'location=yes,toolbar=yes');
		ref.addEventListener('exit', this.VerifyPayment);
	},
	//-------------------------------------------------------------
	VerifyPayment: function()
	{
		$.ajax({
			type: "POST",
			method: "POST",
			url: hamrahpay.verify_address,
			data: {
				pay_code:hamrahpay.pay_code,
				sku: hamrahpay.product_sku,
				device_id: hamrahpay.device_id,
				verification_type:hamrahpay.verification_type
			},
			// Work with the response
			success: function( response ) {
				console.log(response);
				if (response.error==false)
				{
					if (response.status=="SUCCESSFUL_PAYMENT")
					{
						//
					}
				}
				else
				{
					alert(response.message);
				}
				
				
			}
		}).fail(function(data) {
				hamrahpay.pay_code='';
				//console.log( data );
				alert('خطایی در ارتباط با سرور پیش آمده است . لطفا مجدد تلاش نمایید.');
		});
	},
	StoreState: function(sku,value)
	{
	},
	//--------------------------
	Activation: function(sku)
	{
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
		var uuid = (device.uuid!=null)?device.uuid:Math.random(1,1000);
		$('#pay_btn').click(function(){
			hamrahpay.PayRequest('hp_5415e384f37bf802917441',uuid);
		});
		//alert(uuid);
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