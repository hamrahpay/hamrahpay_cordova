/*  Hamrahpay Apache Cordova Library
	www.Hamrahpay.com
	https://github.com/hamrahpay
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
	
	// This method checks the internet connection state
	// return true || false
	CheckInternetConnection: function()
	{
		var networkState = navigator.connection.type;
		//console.log(device.platform);
		if (device.platform!='browser')
			if (networkState == Connection.NONE || networkState =='none' || networkState == Connection.UNKNOWN)
				return 'offline';
			else
				return 'online';
		else
			return 'online';
			
	},
	// This method send Payment request to hamrahpay and shows payment page
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
				success: function( response ) {
					console.log(response);
					if (response.error==false)
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
					alert('خطایی در برقراری ارتباط با سرور پیش آمده است . لطفا ابتدا از صحت اتصال به اینترنت اطمینان حاصل فرمایید و مجددا تلاش کنید.');
			});
		}
		else
		{
			alert('لطفا ابتدا به اینترنت متصل شوید و مجددا تلاش بفرمایید.');
		}
	},
	// This method shows Payment Page
	ShowPaymentPage: function(pay_code)
	{
		var payment_link = this.payment_address+pay_code;
		var ref = cordova.InAppBrowser.open(payment_link, '_blank', 'location=yes,toolbar=yes');
		ref.addEventListener('exit', this.VerifyPayment);
		ref.addEventListener('loadstart', hamrahpay.loadStartCallBack);
		ref.addEventListener('loadstop', hamrahpay.loadStopCallBack);
	},
	loadStartCallBack:function()
	{
		hamrahpay.changeStatusText("در حال بارگذاری...");
	},
	loadStopCallBack:function()
	{
		hamrahpay.changeStatusText('');
	},
	changeStatusText:function(text)
	{
		var elem = document.getElementById('status_bar');
		if (elem)
			$('#status_bar').text(text);
	},
	//-------------------------------------------------------------
	// This method verifies the payment 
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
						hamrahpay.Activation(hamrahpay.product_sku);
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
	// This method stores value for consumable products
	// sku = sku of product (String) | شناسه کالا
	// value = Value to store (Integer) | مقدار سکه یا امتیاز یا هرچیزی که میخواهید ذخیره شود  به صورت عددی وارد شود
	StoreConsumable: function(sku,value)
	{
		var storage = window.localStorage;
		var itemValue = storage.getItem(sku);
		if (!itemValue)
			storage.setItem(sku,value);
		else
		{
			storage.setItem(sku,+value + +itemValue);
		}	
		return true;
	},
	// This method stores the state of buyable product
	// sku = sku of product (String) | شناسه کالا
	StoreBuyable:function(sku)
	{
		var storage = window.localStorage;
		storage.setItem(sku,true);
	},
	// This method consumes amount of your value related to sku
	// sku = sku of product (String) | شناسه کالا
	// minusValue = value tha must subtrack from value (Integer) | مقداری که میخواهید از امتیاز یا سکه یا هرچیزی از یک کالا کسر شود.
	Consume:function(sku,minuseValue)
	{
		var storage = window.localStorage;
		var itemValue = storage.getItem(sku);
		if(!itemValue)
			return false;
		else
		{
			storage.setItem(sku,parseInt(itemValue-minuseValue));
			return true;
		}
	},
	// This method return the remained value of consumable sku | میزان اعتبار یا امتیاز باقیمانده از یک کالای مصرف شدنی را برمیگرداند.
	getConsumeValue:function(sku)
	{
		var storage = window.localStorage;
		var itemValue = storage.getItem(sku);
		if (!itemValue)
			return 0;
		else
			return itemValue;
	},
	// This methods checks if product is buyed
	isPremium:function(sku)
	{
		var storage = window.localStorage;
		var value = storage.getItem(sku);
		if (!value)
			return false;
		else
			return value;
		
	},
	//--------------------------
	// Main Activation method
	// تابع اصلی برنامه که پس از پرداخت موفق صدا زده میشود. در این تابع باید کدهای خود را بنویسید.
	Activation: function(sku)
	{
		// یک مثال از کالای خریدنی و مصرف شدنی - شما باید بنا به نوع برنامه خود یکی از آنها را استفاده نمایید.
		
		//************************************
		// برای محصولات خریدنی
		hamrahpay.StoreBuyable(sku);
		// برای چک کردن وضعیت خرید
		if (hamrahpay.isPremium(sku))
			alert('این برنامه با موفقیت خرید شده است.');
		else
			alert('این برنامه هنوز خرید نشده است.');
			
		//************************************	
		// برای محصولات مصرف شدنی
		hamrahpay.StoreConsumable(sku,100);// 100 میزان امتیاز یا سکه یا بنزین 
		var scoreValue = hamrahpay.getConsumeValue(sku); // برای دریافت آخرین میزان امتیاز یا بزنین باقیمانده  یا اعتبار خرید
		hamrahpay.Consume(sku,100);// مصرف کردن به میزان دلخواه - در ایحا 100 امتیاز مصرف کردیم
	}
	
};