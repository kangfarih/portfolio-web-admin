var dataSet = [];
var detailData = [];
var unityData = [];
var gameInstance;
var u;

$(document).ready(function () {
    if (window.location.search.substring(1) !== '') {
        PageScript.GetList();
    } else {
        window.location = ApiService.urlDomain;
    }
});

var PageScript = new function () {
    this.GetList = function () {
        var dataUser = JSON.parse(Helper.GetCookie("data_user"));
        var fd = new Object();
        var apiUrl = "api/project360" + "/" + this.GetIdData() + "/" + this.GetIdSubdata();
        if (ApiService.use_dummy_data) { apiUrl = "dummy_detaildata.json"; }
        var promise = ApiService.RestService("GET", apiUrl, fd, dataUser.token);
        promise.done(function (data) {
            if (ApiService.use_dummy_data) { data = JSON.stringify(data) }
            var results = JSON.parse(data);
            if (results.status == "SUCCESS") {
                this.pageDataTotal = results.total_image;
                var itemNo = this.pageOffset;
                dataSet = results.data[0].list_pinpoint;
                detailData = results.data[0];                
            }
            else {
                $("#loader-content").fadeOut("fast");
                $('div[name="loader-content-table"]').addClass('attr-display-none');

                if (results.error_code == "project_not_found") {

                    ApiService.ShowAlertContent("ERROR : Data yang dicari tidak ditemukan", false, results.error_code);
                }

                else {
                    ApiService.ShowAlertContent("ERROR : " + results.message, false, results.error_code);
                }

            }
            this.SetBreadcump();

        }.bind(this).bind(dataUser))
            .fail(function (xhr) {
                ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
            }.bind(this));
    }

    this.PostDataCheck = function () {
        this.PostData();
    }

    // ============
    // == Helper ==
    // ============

    this.HideLoader = function(){
        $("#loader-unity").fadeOut("fast");
    }

    this.GetIdData = function () {
        var id = window.location.search.substring(1).split('&')[0];
        return id;
    }

    this.GetIdSubdata = function () {
        var id = window.location.search.substring(1).split('&')[1];
        return id;
    }

    this.SetBreadcump = function () {
        var arrBreadcump = [
            { "name": "Home", "url": ApiService.urlDomain, "active": false },
            { "name": "Data", "url": ApiService.urlDomain + "data.html", "active": false },
            { "name": detailData.name, "url": "detaildata.html?" + this.GetIdData(), "active": false },
            { "name": 'Unity Page', "url": "#", "active": true }
        ];
        Helper.SetBreadcump(arrBreadcump);
    }

    this.AddWebApp = function () {
        var arrPoin = poin.split('|');
        var iframePinPoin = $('iframe[name="pinpoin-webapp"]').contents();
        iframePinPoin.find('#x-coordinat').val(arrPoin[0]);
        iframePinPoin.find('#y-coordinat').val(arrPoin[1]);
        iframePinPoin.find('#z-coordinat').val(arrPoin[2]);
    }
}


