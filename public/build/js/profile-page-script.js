$(document).ready(function () {
	ProfilePage.GetProfileUser();
});


//==============
//=== Helper ===
//==============
var ProfilePage = new function () {
	this.GetProfileUser = function () {
		var dataUser = JSON.parse(Helper.GetCookie("data_user"));
		var fd = new Object();
		var apiUrl = "api/user/" + dataUser.user;
		if(ApiService.use_dummy_data){apiUrl = "dummy_profile.json"}
		var promise = ApiService.RestService("GET", apiUrl, fd, dataUser.token);
		promise.done(function (data) {
			if(ApiService.use_dummy_data){data = JSON.stringify(data)}
			var results = JSON.parse(data);
			if (results.status == "SUCCESS") {
				var user = results.data[0];

				$('input[name="id-user"]').val(user.id);
				$('input[name="id-category"]').val(user.id_category);
				$('input[name="username"]').val(user.username);
				$('input[name="name"]').val(user.name);
				$('input[name="email"]').val(user.email);
				$('input[name="address"]').val(user.address);
				$('input[name="phone"]').val(user.phone);
				$("#loader-content").fadeOut("fast");
			}

			else {

				ApiService.ShowAlertContent("ERROR : " + results.message, false);


			}
		}.bind(this))
			.fail(function (xhr) {

				ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
			}.bind(this));
	}
	// ===================
	// Edit User Profile
	// ===================
	this.EditProfileUser = function () {
		var form = $('form[name="profile-user-form"]');
		if (form.parsley().isValid()) {
			event.preventDefault();

			$('div[name="cont-btn-edit-user"]').addClass('attr-display-none');
			$('div[name="loading-edit-user"]').removeClass('attr-display-none');

			var fd = new Object();
			fd.id_user = $('input[name="id-user"]').val();
			fd.id_category = $('input[name=id-category]').val() + ' ';
			fd.name = $('input[name="name"]').val();
			fd.email = $('input[name="email"]').val();
			fd.address = $('input[name="address"]').val();
			fd.phone = $('input[name="phone"]').val();


			var dataUser = JSON.parse(Helper.GetCookie("data_user"));
			var promise = ApiService.RestService("POST", "api/user", fd, dataUser.token);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					dataUser.name = name;
					Helper.SetCookie("data_user", JSON.stringify(dataUser));
					$('div[name="cont-btn-edit-user"]').removeClass('attr-display-none');
					$('div[name="loading-edit-user"]').addClass('attr-display-none');
					ApiService.ShowAlertContent("SUCCESS : " + "Update profile berhasil", true);
				}
				else {
					ApiService.ShowAlertContent("ERROR : " + results.message, false);
					$('div[name="cont-btn-edit-user"]').removeClass('attr-display-none');
					$('div[name="loading-edit-user"]').addClass('attr-display-none');
				}
			}.bind(this))
				.fail(function (xhr) {
					ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
					$('div[name="cont-btn-edit-user"]').removeClass('attr-display-none');
					$('div[name="loading-edit-user"]').addClass('attr-display-none');
				}.bind(this));

		}
	}
	// ===================
	// Edit Password User
	// ===================

	this.EditPasswordUser = function () {
		var form = $('form[name="ganti-password-form"]');
		if (form.parsley().isValid()) {
			event.preventDefault();

			$('div[name="cont-btn-edit-password"]').addClass('attr-display-none');
			$('div[name="loading-edit-password"]').removeClass('attr-display-none');
			var fd = new Object();
			fd.password_old = $('input[name="old-password"]').val();
			fd.password = $('input[name="new-password"]').val();

			var dataUser = JSON.parse(Helper.GetCookie("data_user"));
			var promise = ApiService.RestService("POST", "api/passwordUpdate", fd, dataUser.token);
			promise.done(function (data) {
				var results = JSON.parse(data);
				if (results.status == "SUCCESS") {
					$('div[name="cont-btn-edit-password"]').removeClass('attr-display-none');
					$('div[name="loading-edit-password"]').addClass('attr-display-none');
					ApiService.ShowAlertContent("SUCCESS : " + "Update password berhasil", true);
				}
				else {
					ApiService.ShowAlertContent("ERROR : " + results.message, false);
					$('div[name="cont-btn-edit-password"]').removeClass('attr-display-none');
					$('div[name="loading-edit-password"]').addClass('attr-display-none');
				}

				$('input[name="old-password"]').val("");
				$('input[name="new-password"]').val("");
				$('input[name="confirm-new-password"]').val("");
			}.bind(this))
				.fail(function (xhr) {
					ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
					$('div[name="cont-btn-edit-password"]').removeClass('attr-display-none');
					$('div[name="loading-edit-password"]').addClass('attr-display-none');
				}.bind(this));
		}
	}
}