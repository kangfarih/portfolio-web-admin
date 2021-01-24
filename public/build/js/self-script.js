$(document).ready(function () {
	if (true) {
		Helper.CheckDataUser();
		Layout.InitLayout();
		CheckBrowserCompatibility();
	}
});

//===================
//=== API Service ===
//===================
var ApiService = new function () {
	this.use_dummy_data = true;
	//parameter
	this.timeoutDuration = 600000;
	this.urlDomain = "http://localhost/";
	this.baseUrlApi = "http://app360.kunkun360.com/";

	//mesage
	this.messageFailApiService = "Periksa jaringan koneksi internet";

	//=====================
	//=== REST Service ===
	//=====================
	this.RestService = function (restType, url, formData, token = "") {
		var apiurl = this.baseUrlApi + url;

		if (this.use_dummy_data) {
			restType = 'GET';
			apiurl = this.urlDomain + 'build/js/dummy-data/' + url;
		}

		var promise = $.ajax({
			type: restType,
			headers: {
				'token': token
			},
			enctype: 'multipart/form-data',
			url: apiurl,
			data: this.EscapeQuote(formData),
			processData: false,
			contentType: false,
			cache: false,
			timeout: this.timeoutDuration
		});
		return promise;
	};

	this.EscapeQuote = function (form) {
		newform = new FormData();

		// for (var pair of form.entries()) {
		// 	if (typeof pair[1] === 'string') {
		// 		newform.append(pair[0], pair[1].replace(/(')+?/g, '"'));
		// 	} else {
		// 		newform.append(pair[0], pair[1]);
		// 	}
		// }

		for (var i in form) {
			if (typeof form[i] === 'string') {
				newform.append(i, form[i].replace(/(')+?/g, '"'));
			} else {
				newform.append(i, form[i]);
			}
			// console.log(i + ',' + form[i] + ':' + typeof form[i]);
		}
		return newform
	}

	//=====================
	//=== Login Service ===
	//=====================
	this.LoginService = function () {
		var form = $('form[name="login-form"]');

		if (form.parsley().isValid()) {
			event.preventDefault();
			$('div[name="cont-btn-login"]').addClass('attr-display-none');
			$('div[name="loading-login"]').removeClass('attr-display-none');

			var fd = new FormData();
			fd.append("username", $('input[name="login-username"]').val());
			fd.append("password", $('input[name="login-password"]').val());
			var form = new Object();

			form.username = $('input[name="login-username"]').val();
			form.password = $('input[name="login-password"]').val();
			var url = "api/login";
			if (ApiService.use_dummy_data) {
				url = "dummy_login.json";
			}

			var promise = this.RestService("POST", url, form);

			//$(location).attr('href', this.urlDomain);

			promise.done(function (data) {
				if(ApiService.use_dummy_data){data = JSON.stringify(data)}
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					Helper.SetCookie("data_user", data);
					$(location).attr('href', this.urlDomain);
				} else {
					this.ShowAlertLoginRegisterInfo("ERROR : User atau Password salah.", false);
					$('div[name="cont-btn-login"]').removeClass('attr-display-none');
					$('div[name="loading-login"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					this.ShowAlertLoginRegisterInfo("ERROR : " + this.messageFailApiService, false);
					$('div[name="cont-btn-login"]').removeClass('attr-display-none');
					$('div[name="loading-login"]').addClass('attr-display-none');
				}.bind(this));
		}
	};

	//========================
	//=== Register Service ===
	//========================
	this.RegisterService = function () {
		var form = $('form[name="register-form"]');

		if (form.parsley().isValid()) {
			event.preventDefault();

			$('div[name="cont-btn-register"]').addClass('attr-display-none');
			$('div[name="loading-register"]').removeClass('attr-display-none');

			var fd = new FormData();
			fd.append("name", $('input[name="register-name"]').val());
			fd.append("username", $('input[name="register-username"]').val());
			fd.append("email", $('input[name="register-email"]').val());
			fd.append("password", $('input[name="register-password"]').val());
			fd.append("password2", $('input[name="register-confirm-password"]').val());

			var promise = this.RestService("POST", "api/user", fd);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					$('div[name="cont-btn-register"]').removeClass('attr-display-none');
					$('div[name="loading-register"]').addClass('attr-display-none');
					this.ShowAlertLoginRegisterInfo("SUCCESS : " + "Registrasi User Berhasil Silahkan Login", true);
					this.ResetLoginRegisterForm();
					$(location).attr('href', "#signin");
				} else {
					this.ShowAlertLoginRegisterInfo("ERROR : " + results.message, false);
					$('div[name="cont-btn-register"]').removeClass('attr-display-none');
					$('div[name="loading-register"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					this.ShowAlertLoginRegisterInfo("ERROR : " + this.messageFailApiService, false);
					$('div[name="cont-btn-register"]').removeClass('attr-display-none');
					$('div[name="loading-register"]').addClass('attr-display-none');
				}.bind(this));
		}
	};

	//==============================
	//=== Reset Password Service ===
	//==============================
	this.ResetPasswordService = function () {
		var form = $('form[name="forgot-password-form"]');
		if (form.parsley().isValid()) {
			event.preventDefault();

			$('div[name="cont-btn-forgot-password"]').addClass('attr-display-none');
			$('div[name="loading-forgot-password"]').removeClass('attr-display-none');

			var email = $('input[name="forgot-password-email"]').val();

			var fd = new FormData();
			fd.append("email", email);

			var promise = this.RestService("POST", "api/passwordReset", fd);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					$('div[name="cont-btn-forgot-password"]').removeClass('attr-display-none');
					$('div[name="loading-forgot-password"]').addClass('attr-display-none');
					this.ShowAlertLoginRegisterInfo("SUCCESS : " + "Reset Password Berhasil dikirim ke " + email + " Silahkan Cek Email Untuk Melihat Password baru", true);
					this.ResetLoginRegisterForm();
					$(location).attr('href', "#signin");
				} else {
					this.ShowAlertLoginRegisterInfo("ERROR : " + results.message, false);
					$('div[name="cont-btn-forgot-password"]').removeClass('attr-display-none');
					$('div[name="loading-forgot-password"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					this.ShowAlertLoginRegisterInfo("ERROR : " + this.messageFailApiService, false);
					$('div[name="cont-btn-forgot-password"]').removeClass('attr-display-none');
					$('div[name="loading-forgot-password"]').addClass('attr-display-none');
				}.bind(this));
		}
	};

	//reset form login-register
	this.ResetLoginRegisterForm = function () {
		$('form[name="login-form"]').trigger('reset');
		$('form[name="register-form"]').trigger('reset');
		$('form[name="forgot-password-form"]').trigger('reset');
	};

	//show alert info login-register
	this.ShowAlertLoginRegisterInfo = function (message, status) {
		if (status) {
			$('div[name="alert-info"]').addClass('alert-success');
			$('div[name="alert-info"]').removeClass('alert-danger');
		} else {
			$('div[name="alert-info"]').addClass('alert-danger');
			$('div[name="alert-info"]').removeClass('alert-success');
		}

		$('div[name="alert-info"]').removeClass('out');
		$('div[name="alert-info"]').addClass('in');
		$('span[name="alert-info"]').html(message);

		setTimeout(this.HideAlertLoginRegisterInfo, 3000);
	};

	//hide alert info login-register
	this.HideAlertLoginRegisterInfo = function () {
		$('div[name="alert-info"]').removeClass('in');
		$('div[name="alert-info"]').addClass('out');

		$('div[name="alert-info"]').removeClass('alert-success');
		$('div[name="alert-info"]').removeClass('alert-danger');
	};

	//hide alert info content
	this.HideAlertContent = function () {
		$('div[name="alert-info-content"]').removeClass('in');
		$('div[name="alert-info-content"]').addClass('out');

		$('div[name="alert-info-content"]').removeClass('alert-content-info-show');
		$('div[name="alert-info-content"]').addClass('alert-content-info-hide');
		$('div[name="col-breadcumps"]').addClass('col-breadcump-alert-hide');

		$('div[name="alert-info-content"]').removeClass('alert-success');
		$('div[name="alert-info-content"]').removeClass('alert-danger');
	};

	//show alert info content
	this.ShowAlertContent = function (message, status) {
		if (status) {
			$('div[name="alert-info-content"]').addClass('alert-success');
			$('div[name="alert-info-content"]').removeClass('alert-danger');
		} else {
			$('div[name="alert-info-content"]').addClass('alert-danger');
			$('div[name="alert-info-content"]').removeClass('alert-success');
		}

		$('div[name="alert-info-content"]').addClass('alert-content-info-show');
		$('div[name="alert-info-content"]').removeClass('alert-content-info-hide');
		$('div[name="col-breadcumps"]').removeClass('col-breadcump-alert-hide');

		$('div[name="alert-info-content"]').removeClass('out');
		$('div[name="alert-info-content"]').addClass('in');
		$('span[name="alert-info-content"]').html(message);

		setTimeout(this.HideAlertContent, 5000);
	};

}


//==============
//=== Helper ===
//==============
var Helper = new function () {
	this.SetBreadcump = function (arrBreadcump) {
		var str = "";
		for (var i = 0; i < arrBreadcump.length; i++) {
			if (arrBreadcump[i].active)
				str += "<li class='active'>" + arrBreadcump[i].name + "</li>";
			else
				str += "<li><a href='" + arrBreadcump[i].url + "'>" + arrBreadcump[i].name + "</a></li>";

		}
		$('ul[name="breadcrumb"]').html(str);
		$('title').html('Plexus - ' + arrBreadcump[arrBreadcump.length - 1].name)
	}

	this.SetCookie = function (key, value) {
		var expires = new Date();
		expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
		document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
	}

	this.GetCookie = function (key) {
		var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
		return keyValue ? keyValue[2] : null;
	}

	this.DeleteCookie = function (key) {
		document.cookie = key + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	};

	this.CheckDataUser = function () {

		var dataUser = this.GetCookie("data_user");
		if (dataUser != undefined && dataUser != "") {
			Helper.SetCookie("data_user", dataUser);
			this.fullyLoaded(true, dataUser, ApiService.urlDomain);
			Helper.CheckAuthorize();
		} else {
			this.fullyLoaded(false, dataUser, ApiService.urlDomain + "login.html");
		}
	}

	this.SetUserData = function (dataUser) {
		var dataUser = JSON.parse(dataUser);
		$('span[name="nama-user"]').html(this.CapitalizeFirstLetter(dataUser.name));
	}

	this.CapitalizeFirstLetter = function (string) {
		var str = string.split(" ");
		for (var i = 0; i < str.length; i++) {
			str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1) + " ";
		}
		return str.join(" ");
	}

	this.fullyLoaded = function (stat, dataUser, urlDirect) {
		var currUrl = $(location).attr('href');
		if (stat) {
			setTimeout(function () {
				if (currUrl.includes("login.html")) {
					$(location).attr('href', urlDirect);
				} else {
					this.SetUserData(dataUser);
					$("#loader").fadeOut("slow");
					// this.CheckUserManagement(urlDirect);
				}
			}.bind(this), 10);
		} else {
			setTimeout(function () {
				if (currUrl.includes("login.html")) {
					$("#loader").fadeOut("slow");
				} else {
					$(location).attr('href', urlDirect);
				}
			}.bind(this), 1000);
		}
	}

	this.CheckUserManagement = function (urlDirect) {

		var dataUser = JSON.parse(Helper.GetCookie("data_user"));

		var isManageUser = false;
		for (var h = 0; h < dataUser.permission.length; h++) {
			if (dataUser.permission[h] == "user_manage") {
				isManageUser = true;
				break;
			}
		}

		var isManageCrawler = false;
		for (var h = 0; h < dataUser.permission.length; h++) {
			if (dataUser.permission[h] == "crawler_manage") {
				isManageCrawler = true;
				break;
			}
		}

		var currUrl = $(location).attr('href');
		if (currUrl.includes("user-list.html")) {
			if (!isManageUser)
				$(location).attr('href', urlDirect);
		} else if (currUrl.includes("config.html")) {
			if (!isManageCrawler)
				$(location).attr('href', urlDirect);
		} else if (currUrl.includes("export.html")) {
			if (!isManageCrawler)
				$(location).attr('href', urlDirect);
		} else {
			if (!isManageUser)
				$('li[name="manage-user"]').addClass('hidden');

			if (!isManageCrawler)
				$('li[name="manage-crawler"]').addClass('hidden');
		}


	}

	this.Logout = function () {

		var dataUser = JSON.parse(Helper.GetCookie("data_user"));
		var fd = new FormData();
		var promise = ApiService.RestService("POST", "api/logout", fd, dataUser.token);
		promise.done(function (data) {
			this.DeleteCookie("data_user");
			$(location).attr('href', ApiService.urlDomain + "login.html");
		}.bind(this))
			.fail(function (xhr) {
				this.DeleteCookie("data_user");
				$(location).attr('href', ApiService.urlDomain + "login.html");
			}.bind(this));
	}

	this.CheckAuthorize = function () {
		var str_datauser = Helper.GetCookie("data_user");
		var json_datauser = null;
		try {
			json_datauser = JSON.parse(str_datauser);
		} catch (error) {
			console.log('error parse datauser');
		}

		if (json_datauser != null) {
			var dataUser = json_datauser;
			var fd = new FormData();

			var apiUrl = "api/user/" + dataUser.user;

			if(ApiService.use_dummy_data){apiUrl = "dummy_profile.json"}

			var promise = ApiService.RestService("GET", apiUrl, fd, dataUser.token);

			promise.done(function (data) {
				if(ApiService.use_dummy_data){data = JSON.stringify(data)}
				var results = JSON.parse(data)
				if (results.error_code === "not_authorized") {

					ApiService.ShowAlertContent("ERROR : " + results.message + '. Dalam 5 detik akan menuju halaman login.', false, results.error_code);

					setTimeout(function () {
						Helper.Logout();
					}, 5000);
				}
			});
		} else {
			Helper.DeleteCookie("data_user");
		}
	}

	//hide alert info content
	this.HideAlertModalEditAdd = function () {
		$('div[name="alert-info-modal-edit-add"]').removeClass('in');
		$('div[name="alert-info-modal-edit-add"]').addClass('out');
		$('div[name="alert-info-modal-edit-add"]').addClass('hidden');

		$('div[name="alert-info-modal-edit-add"]').removeClass('alert-success');
		$('div[name="alert-info-modal-edit-add"]').removeClass('alert-danger');
	};

	//show alert info content
	this.ShowAlertModalEditAdd = function (message, status) {
		if (status) {
			$('div[name="alert-info-modal-edit-add"]').addClass('alert-success');
			$('div[name="alert-info-modal-edit-add"]').removeClass('alert-danger');
		} else {
			$('div[name="alert-info-modal-edit-add"]').addClass('alert-danger');
			$('div[name="alert-info-modal-edit-add"]').removeClass('alert-success');
		}

		$('div[name="alert-info-modal-edit-add"]').removeClass('out');
		$('div[name="alert-info-modal-edit-add"]').addClass('in');
		$('div[name="alert-info-modal-edit-add"]').removeClass('hidden');
		$('span[name="alert-info-modal-edit-add"]').html(message);

		setTimeout(this.HideAlertModalEditAdd, 3000);
	};



	//Formating text before send to server
	this.FormatText = function (txt) {
		// txt = txt.replace(/(?:<b>)/g, '*b*'); //change <b> to *b*
		// txt = txt.replace(/(?:<\/b>)/g, '*/b*'); //change </b> to **b*
		// txt = txt.replace(/(?:<i>)/g, '*i*'); //change <i> to *i*
		// txt = txt.replace(/(?:<\/i>)/g, '*/i*'); //change </i> to **i*
		// txt = txt.replace(/(?:<u>)/g, '*u*'); //change <u> to *u*
		// txt = txt.replace(/(?:<\/u>)/g, '*/u*'); //change </u> to **u*

		txt = txt.replace(/(?:\r\n|\r|\n)/g, '*br*'); //change \n to *br*
		txt = txt.replace(/(<\/p><p>)+?/g, '*br*'); //change </p><p> to *br*
		txt = txt.replace(/(<br>)+?/g, '*br*'); //change </p><p> to *br*
		txt = txt.replace(/(<p>)+/, ''); //remove first <p>
		txt = txt.replace(/(<\/p>)+$/, ''); //remove last </p>
		txt = txt.replace(/(?:<div>)/g, ''); //remove first <p>
		txt = txt.replace(/(?:<\/div>)/g, ''); //remove first <p>

		return txt;
	}
	this.UnformatEditor = function (txt) {
		txt = txt.replace(/\*br\s*\/?\*/ig, '<br>');

		return txt;
	}
	this.UnformatText = function (txt) {
		txt = txt.replace(/\*br\s*\/?\*/ig, '\n');
		return txt;
	}
}

// ============
// == Layout ==
// ============
var Layout = new function () {

	// Replace Left Menu 
	// =================
	// Open leftmenu.html to edit CMS Menu
	// =================

	this.InitLayout = function () {
		this.leftmenu();
		this.footer();
		this.SetFavicon();
		this.EventPreventDefault();
	}

	this.leftmenu = function () {
		$('.left_col').empty();
		$('.left_col').load('leftmenu.html');
	}

	this.footer = function () {
		$('div[class="pull-right"]').html("PLEXUS ADMIN CMS")
	}

	this.SetFavicon = function () {
		var icon = ['favicon.png'];
		var link = '<link id="icon-a" rel="shortcut icon" type="image/png" href="' + icon + '" />'
		$('title').after(link);
	}

	this.EventPreventDefault = function () {
		$('button[type="submit"]').on('click', function (e) {
			// e.preventDefault();
		});
	}
}

parsley.addValidator('imagemindimensions', {
	requirementType: 'string',
	validateString: function (value, requirement, parsleyInstance) {
		let file = parsleyInstance.$element[0].files[0];
		let [width, height] = requirement.split('x');
		let image = new Image();
		let deferred = $.Deferred();

		image.src = window.URL.createObjectURL(file);
		image.onload = function () {
			if (image.width == width && image.height == height) {
				deferred.resolve();
			} else {
				deferred.reject();
			}
		};
		return deferred.promise();
	},
	messages: {
		en: 'Image dimensions have to be %spx'
	}
});

parsley.addValidator('imagemindimensionsmax', {
	requirementType: 'string',
	validateString: function (value, requirement, parsleyInstance) {
		let file = parsleyInstance.$element[0].files[0];
		let [width, height] = requirement.split('x');
		let image = new Image();
		let deferred = $.Deferred();

		image.src = window.URL.createObjectURL(file);
		image.onload = function () {
			if (image.width <= width && image.height <= height) {
				deferred.resolve();
			} else {
				deferred.reject();
			}
		};
		return deferred.promise();
	},
	messages: {
		en: 'Maximum image dimensions is %spx'
	}
});


var categoryBrowser = (function () {
	var ua = navigator.userAgent,
		tem,
		M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if (/trident/i.test(M[1])) {
		tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
		return 'IE ' + (tem[1] || '');
	}
	if (M[1] === 'Chrome') {
		tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
		if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
	}
	M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
	if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
	return M.join(' ');
})();


var browserList = new Array();
browserList['Chrome'] = 57;
browserList['Firefox'] = 52;
browserList['Edge'] = 16;

var isBrowserSupported = function () {
	browsertype = categoryBrowser.split(' ')[0];
	browserversion = categoryBrowser.split(' ')[1];
	isSupport = false;
	console.log
	for (var i in browserList) {
		if (browsertype == i && browserversion > browserList[i]) {
			return isSupport = true;
		} else {
			return isSupport = false;
		}
	}
}

var CheckBrowserCompatibility = function () {

	if (isBrowserSupported()) {
		console.log('Browser ' + categoryBrowser + ' is supported');
	}

}

