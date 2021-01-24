$(document).ready(function () {
	PageScript.GetPageScript();
	PageScript.SetBreadcump();
});


//==============
//=== Helper ===
//==============
var PageScript = new function () {
	this.GetPageScript = function () {
		var dataUser = JSON.parse(Helper.GetCookie("data_user"));
		var form = new Object();
		var apiUrl = "api/config";
		if (ApiService.use_dummy_data) { apiUrl = "dummy_config.json" }
		var promise = ApiService.RestService("GET", apiUrl, form, dataUser.token);
		promise.done(function (data) {
			if (ApiService.use_dummy_data) { data = JSON.stringify(data) }
			var results = JSON.parse(data);
			if (results.status == "SUCCESS") {
				var Config = new Object();
				results.data.forEach(function (item) {
					Config[item.config_name] = item;
					Config[item.id] = item;
				});

				var content = Config['about_content'];
				content.html_value = Helper.UnformatText(content.config_value);
				var image = Config['about_image'];
				var totalimages = Config['about_total_images'];
				var totalcategorys = Config['about_total_categorys'];
				var totalprojects = Config['about_total_projects'];
				var address = Config['contact_address'];
				address.html_value = Helper.UnformatText(address.config_value);
				var email = Config['contact_email'];
				var latlong = Config['contact_latlong'];
				var phone = Config['contact_mobile'];
				var office = Config['contact_office'];
				var workday = Config['contact_workday'];
				workday.html_value = Helper.UnformatText(workday.config_value);


				$('textarea[name="about-content"]').val(content.html_value);
				$('input[name="about-image"]').val(image.config_value);
				$('input[name="about-total-image"]').val(totalimages.config_value);
				$('input[name="about-total-category"]').val(totalcategorys.config_value);
				$('input[name="about-total-project"]').val(totalprojects.config_value);
				$('textarea[name="contact-address"]').val(address.html_value);
				$('input[name="contact-email"]').val(email.config_value);
				$('input[name="contact-latlong"]').val(latlong.config_value);
				$('input[name="contact-phone"]').val(phone.config_value);
				$('input[name="contact-office"]').val(office.config_value);
				$('textarea[name="contact-workday"]').val(workday.html_value);


				$('#image').attr('src', image.config_value);
				$("#loader-content").fadeOut("fast");
			} else {

				ApiService.ShowAlertContent("ERROR : " + results.message, false);


			}
		}.bind(this))
			.fail(function (xhr) {

				ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
			}.bind(this));
	}
	// ===================
	// Edit About Content
	// ===================
	this.EditContent = function () {
		var form = $('form[name="about-content-form"]');
		if (form.parsley().isValid()) {
			event.preventDefault();
			$('div[name="cont-btn-edit-content"]').addClass('attr-display-none');
			$('div[name="loading-edit-content"]').removeClass('attr-display-none');

			var form = new Object();
			form.config_name = "about_content";
			var contentTxt = Helper.FormatText($('textarea[name=about-content]').val());
			form.config_value = contentTxt;
			var dataUser = JSON.parse(Helper.GetCookie("data_user"));
			var promise = ApiService.RestService("POST", "api/config", form, dataUser.token);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					dataUser.name = name;
					Helper.SetCookie("data_user", JSON.stringify(dataUser));
					$('div[name="cont-btn-edit-content"]').removeClass('attr-display-none');
					$('div[name="loading-edit-content"]').addClass('attr-display-none');
					ApiService.ShowAlertContent("SUCCESS : " + "Update berhasil", true);
					this.GetPageScript();
				} else {
					ApiService.ShowAlertContent("ERROR : " + results.message, false);
					$('div[name="cont-btn-edit-content"]').removeClass('attr-display-none');
					$('div[name="loading-edit-content"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
					$('div[name="cont-btn-edit-content"]').removeClass('attr-display-none');
					$('div[name="loading-edit-content"]').addClass('attr-display-none');
				}.bind(this));
		}
	}

	// ===================
	// Edit About Image
	// ===================
	this.EditImage = function () {
		var form = $('form[name="about-content-form"]');
		event.preventDefault();

		form.parsley().whenValid().done(function () {
			$('div[name="cont-btn-edit-image"]').addClass('attr-display-none');
			$('div[name="loading-edit-image"]').removeClass('attr-display-none');

			var form = new Object();
			form.config_name = "about_image";
			form.config_value = "";
			form.image = $('input[name="about-file"]')[0].files[0];


			var dataUser = JSON.parse(Helper.GetCookie("data_user"));
			var promise = ApiService.RestService("POST", "api/config", form, dataUser.token);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					dataUser.name = name;
					Helper.SetCookie("data_user", JSON.stringify(dataUser));
					$('div[name="cont-btn-edit-image"]').removeClass('attr-display-none');
					$('div[name="loading-edit-image"]').addClass('attr-display-none');
					ApiService.ShowAlertContent("SUCCESS : " + "Update berhasil", true);
					this.GetPageScript();
				} else {
					ApiService.ShowAlertContent("ERROR : " + results.message, false);
					$('div[name="cont-btn-edit-image"]').removeClass('attr-display-none');
					$('div[name="loading-edit-image"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
					$('div[name="cont-btn-edit-image"]').removeClass('attr-display-none');
					$('div[name="loading-edit-image"]').addClass('attr-display-none');
				}.bind(this));
		}.bind(PageScript))
			.fail(function () {

			})

	}


	// ===================
	// Edit About Total Images
	// ===================
	this.EditTotalCategory = function () {
		var form = $('form[name="about-content-form"]');

		if (form.parsley().isValid()) {
			event.preventDefault();

			$('div[name="cont-btn-edit-total-category"]').addClass('attr-display-none');
			$('div[name="loading-edit-total-category"]').removeClass('attr-display-none');

			var fd = new Object();
			fd.config_name = "about_total_categorys";
			fd.config_value = $('input[name=about-total-category]').val();
			var dataUser = JSON.parse(Helper.GetCookie("data_user"));
			var promise = ApiService.RestService("POST", "api/config", fd, dataUser.token);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					dataUser.name = name;
					Helper.SetCookie("data_user", JSON.stringify(dataUser));
					$('div[name="cont-btn-edit-total-category"]').removeClass('attr-display-none');
					$('div[name="loading-edit-total-category"]').addClass('attr-display-none');
					ApiService.ShowAlertContent("SUCCESS : " + "Update berhasil", true);
					this.GetPageScript();
				} else {
					ApiService.ShowAlertContent("ERROR : " + results.message, false);
					$('div[name="cont-btn-edit-total-category"]').removeClass('attr-display-none');
					$('div[name="loading-edit-total-category"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
					$('div[name="cont-btn-edit-total-category"]').removeClass('attr-display-none');
					$('div[name="loading-edit-total-category"]').addClass('attr-display-none');
				}.bind(this));
		}
	}

	// ===================
	// Edit About Total Images
	// ===================
	this.EditTotalImage = function () {
		var form = $('form[name="about-content-form"]');

		if (form.parsley().isValid()) {
			event.preventDefault();

			$('div[name="cont-btn-edit-total-image"]').addClass('attr-display-none');
			$('div[name="loading-edit-total-image"]').removeClass('attr-display-none');

			var fd = new Object();
			fd.config_name = "about_total_images";
			fd.config_value = $('input[name=about-total-image]').val();
			var dataUser = JSON.parse(Helper.GetCookie("data_user"));
			var promise = ApiService.RestService("POST", "api/config", fd, dataUser.token);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					dataUser.name = name;
					Helper.SetCookie("data_user", JSON.stringify(dataUser));
					$('div[name="cont-btn-edit-total-image"]').removeClass('attr-display-none');
					$('div[name="loading-edit-total-image"]').addClass('attr-display-none');
					ApiService.ShowAlertContent("SUCCESS : " + "Update berhasil", true);
					this.GetPageScript();
				} else {
					ApiService.ShowAlertContent("ERROR : " + results.message, false);
					$('div[name="cont-btn-edit-total-image"]').removeClass('attr-display-none');
					$('div[name="loading-edit-total-image"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
					$('div[name="cont-btn-edit-total-image"]').removeClass('attr-display-none');
					$('div[name="loading-edit-total-image"]').addClass('attr-display-none');
				}.bind(this));
		}
	}

	// ===================
	// Edit About Total Images
	// ===================
	this.EditTotalProject = function () {
		var form = $('form[name="about-content-form"]');

		if (form.parsley().isValid()) {
			event.preventDefault();

			$('div[name="cont-btn-edit-total-project"]').addClass('attr-display-none');
			$('div[name="loading-edit-total-project"]').removeClass('attr-display-none');

			var fd = new Object();
			fd.config_name = "about_total_projects";
			fd.config_value = $('input[name=about-total-project]').val();
			var dataUser = JSON.parse(Helper.GetCookie("data_user"));
			var promise = ApiService.RestService("POST", "api/config", fd, dataUser.token);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					dataUser.name = name;
					Helper.SetCookie("data_user", JSON.stringify(dataUser));
					$('div[name="cont-btn-edit-total-project"]').removeClass('attr-display-none');
					$('div[name="loading-edit-total-project"]').addClass('attr-display-none');
					ApiService.ShowAlertContent("SUCCESS : " + "Update berhasil", true);
					this.GetPageScript();
				} else {
					ApiService.ShowAlertContent("ERROR : " + results.message, false);
					$('div[name="cont-btn-edit-total-project"]').removeClass('attr-display-none');
					$('div[name="loading-edit-total-project"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
					$('div[name="cont-btn-edit-total-project"]').removeClass('attr-display-none');
					$('div[name="loading-edit-total-project"]').addClass('attr-display-none');
				}.bind(this));
		}
	}

	// ===================
	// Edit Contact Address
	// ===================
	this.EditAddress = function () {
		var form = $('form[name="about-contact-form"]');
		if (form.parsley().isValid()) {
			event.preventDefault();
			$('div[name="cont-btn-edit-address"]').addClass('attr-display-none');
			$('div[name="loading-edit-address"]').removeClass('attr-display-none');

			var form = new Object();
			form.config_name = "contact_address";
			var contactaddress = Helper.FormatText($('textarea[name=contact-address]').val());
			form.config_value = contactaddress;

			var dataUser = JSON.parse(Helper.GetCookie("data_user"));
			var promise = ApiService.RestService("POST", "api/config", form, dataUser.token);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					dataUser.name = name;
					Helper.SetCookie("data_user", JSON.stringify(dataUser));
					$('div[name="cont-btn-edit-address"]').removeClass('attr-display-none');
					$('div[name="loading-edit-address"]').addClass('attr-display-none');
					ApiService.ShowAlertContent("SUCCESS : " + "Update berhasil", true);
					this.GetPageScript();
				} else {
					ApiService.ShowAlertContent("ERROR : " + results.message, false);
					$('div[name="cont-btn-edit-address"]').removeClass('attr-display-none');
					$('div[name="loading-edit-address"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
					$('div[name="cont-btn-edit-address"]').removeClass('attr-display-none');
					$('div[name="loading-edit-address"]').addClass('attr-display-none');
				}.bind(this));
		}
	}

	// ===================
	// Edit Contact Email
	// ===================
	this.EditEmail = function () {
		var form = $('form[name="about-contact-form"]');
		if (form.parsley().isValid()) {
			event.preventDefault();
			$('div[name="cont-btn-edit-email"]').addClass('attr-display-none');
			$('div[name="loading-edit-email"]').removeClass('attr-display-none');

			var form = new Object();
			form.config_name = "contact_email";
			form.config_value = $('input[name=contact-email]').val();

			var dataUser = JSON.parse(Helper.GetCookie("data_user"));
			var promise = ApiService.RestService("POST", "api/config", form, dataUser.token);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					dataUser.name = name;
					Helper.SetCookie("data_user", JSON.stringify(dataUser));
					$('div[name="cont-btn-edit-email"]').removeClass('attr-display-none');
					$('div[name="loading-edit-email"]').addClass('attr-display-none');
					ApiService.ShowAlertContent("SUCCESS : " + "Update berhasil", true);
					this.GetPageScript();
				} else {
					ApiService.ShowAlertContent("ERROR : " + results.message, false);
					$('div[name="cont-btn-edit-email"]').removeClass('attr-display-none');
					$('div[name="loading-edit-email"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
					$('div[name="cont-btn-edit-email"]').removeClass('attr-display-none');
					$('div[name="loading-edit-email"]').addClass('attr-display-none');
				}.bind(this));
		}
	}

	// ===================
	// Edit Contact Phone
	// ===================
	this.EditPhone = function () {
		var form = $('form[name="about-contact-form"]');
		if (form.parsley().isValid()) {
			event.preventDefault();
			$('div[name="cont-btn-edit-phone"]').addClass('attr-display-none');
			$('div[name="loading-edit-phone"]').removeClass('attr-display-none');

			var form = new Object();
			form.config_name = "contact_mobile";
			form.config_value = $('input[name=contact-phone]').val();

			var dataUser = JSON.parse(Helper.GetCookie("data_user"));
			var promise = ApiService.RestService("POST", "api/config", form, dataUser.token);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					dataUser.name = name;
					Helper.SetCookie("data_user", JSON.stringify(dataUser));
					$('div[name="cont-btn-edit-phone"]').removeClass('attr-display-none');
					$('div[name="loading-edit-phone"]').addClass('attr-display-none');
					ApiService.ShowAlertContent("SUCCESS : " + "Update berhasil", true);
					this.GetPageScript();
				} else {
					ApiService.ShowAlertContent("ERROR : " + results.message, false);
					$('div[name="cont-btn-edit-phone"]').removeClass('attr-display-none');
					$('div[name="loading-edit-phone"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
					$('div[name="cont-btn-edit-phone"]').removeClass('attr-display-none');
					$('div[name="loading-edit-phone"]').addClass('attr-display-none');
				}.bind(this));
		}
	}

	this.EditOffice = function () {
		var form = $('form[name="about-contact-form"]');
		if (form.parsley().isValid()) {
			event.preventDefault();
			$('div[name="cont-btn-edit-office"]').addClass('attr-display-none');
			$('div[name="loading-edit-office"]').removeClass('attr-display-none');

			var form = new Object();
			form.config_name = "contact_office";
			form.config_value = $('input[name=contact-office]').val();

			var dataUser = JSON.parse(Helper.GetCookie("data_user"));
			var promise = ApiService.RestService("POST", "api/config", form, dataUser.token);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					dataUser.name = name;
					Helper.SetCookie("data_user", JSON.stringify(dataUser));
					$('div[name="cont-btn-edit-office"]').removeClass('attr-display-none');
					$('div[name="loading-edit-office"]').addClass('attr-display-none');
					ApiService.ShowAlertContent("SUCCESS : " + "Update berhasil", true);
					this.GetPageScript();
				} else {
					ApiService.ShowAlertContent("ERROR : " + results.message, false);
					$('div[name="cont-btn-edit-office"]').removeClass('attr-display-none');
					$('div[name="loading-edit-office"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
					$('div[name="cont-btn-edit-office"]').removeClass('attr-display-none');
					$('div[name="loading-edit-office"]').addClass('attr-display-none');
				}.bind(this));
		}
	}

	this.EditWorkday = function () {
		var form = $('form[name="about-contact-form"]');
		if (form.parsley().isValid()) {
			event.preventDefault();
			$('div[name="cont-btn-edit-workday"]').addClass('attr-display-none');
			$('div[name="loading-edit-workday"]').removeClass('attr-display-none');

			var form = new Object();
			form.config_name = "contact_workday";
			var contactworkday = Helper.FormatText($('textarea[name=contact-workday]').val());
			form.config_value = contactworkday;

			var dataUser = JSON.parse(Helper.GetCookie("data_user"));
			var promise = ApiService.RestService("POST", "api/config", form, dataUser.token);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					dataUser.name = name;
					Helper.SetCookie("data_user", JSON.stringify(dataUser));
					$('div[name="cont-btn-edit-workday"]').removeClass('attr-display-none');
					$('div[name="loading-edit-workday"]').addClass('attr-display-none');
					ApiService.ShowAlertContent("SUCCESS : " + "Update berhasil", true);
					this.GetPageScript();
				} else {
					ApiService.ShowAlertContent("ERROR : " + results.message, false);
					$('div[name="cont-btn-edit-workday"]').removeClass('attr-display-none');
					$('div[name="loading-edit-workday"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
					$('div[name="cont-btn-edit-workday"]').removeClass('attr-display-none');
					$('div[name="loading-edit-workday"]').addClass('attr-display-none');
				}.bind(this));
		}
	}

	this.SetBreadcump = function () {
		var arrBreadcump = [{
			"name": "Home",
			"url": ApiService.urlDomain,
			"active": false
		},
		{
			"name": "Config",
			"url": "#",
			"active": true
		}
		];
		Helper.SetBreadcump(arrBreadcump);
	}

	this.readURL = function (input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();

			reader.onload = function (e) {
				$('#image').attr('src', e.target.result);
			}
			reader.readAsDataURL(input.files[0]);
		}
	}

}

$('input[name="about-file"]').change(function () {
	PageScript.readURL(this);
});