var dataSet = [];
var dataDetail = [];
var id_data = window.location.search.substring(1);

$(document).ready(function () {
    if (id_data !== '') {
        PageScript.GetListData();
        PageScript.GetDetailData();
    } else {
        window.location = ApiService.urlDomain + '/';
    }
});

var PageScript = new function () {
    this.GetDetailData = function () {
        var dataUser = JSON.parse(Helper.GetCookie("data_user"));
        var fd = new Object();
        var apiUrl = "api/data" + this.GetIdData();
        if (ApiService.use_dummy_data) { apiUrl = "dummy_detaildata.json"; }
        var promise = ApiService.RestService("GET", apiUrl, fd, dataUser.token);
        promise.done(function (data) {
            if (ApiService.use_dummy_data) { data = JSON.stringify(data); }
            var results = JSON.parse(data);
            if (results.status == "SUCCESS") {
                data = results.data[0];
                dataDetail = data;
                $('p[name="data-name"]').html(data.name);
                $('p[name="data-date"]').html(this.formatDate(data.data_date));
                $('p[name="category-name"]').html(data.category_name);
                $('p[name="description"]').html(data.description);
                $('img[name="image"]').attr("src", data.imagethumb_url);


            } else {
                $('div[name="data-overview"]').addClass("hidden");

            }
            this.SetBreadcump();
        }.bind(this).bind(dataUser))
            .fail(function (xhr) {
                ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
            }.bind(this))

    }
    this.GetListData = function () {
        var dataUser = JSON.parse(Helper.GetCookie("data_user"));
        var fd = new Object();
        var apiUrl = "api/listdata" + this.GetIdData() + "?offset=" + this.pageOffset + "&limit=" + this.pageLimit + this.stringSorting;
        if (ApiService.use_dummy_data) { apiUrl = "dummy_detaildata_list.json"; }
        var promise = ApiService.RestService("GET", apiUrl, fd, dataUser.token);

        promise.done(function (data) {
            if (ApiService.use_dummy_data) { data = JSON.stringify(data); }
            var results = JSON.parse(data);
            if (results.status == "SUCCESS") {
                this.pageDataTotal = results.dataTotal;
                var itemNo = this.pageOffset;
                dataSet = results.data;
                for (var i = 0; i < dataSet.length; i++) {
                    dataSet[i].action = "" +
                        "<button class='btn btn-primary btn-xs btn-action-table'onclick='PageScript.OpenUnityPage(" + i + ")'><i class='fa fa-star'></i> Open Unity Page</button>" +
                        "<button class='btn btn-success btn-xs btn-action-table' onclick='PageScript.Edit(" + i + ")'><i class='fa fa-pencil-square-o'></i> Edit</button>" +
                        "<button class='btn btn-danger btn-xs btn-action-table' onclick='PageScript.Delete(" + i + ")'><i class='fa fa-trash-o'></i> Hapus</button>";

                    itemNo += 1;
                    dataSet[i].no = itemNo + ".";
                    dataSet[i].image = '<img class="img-table" src="' + dataSet[i].default_thumbnail_url + '">';
                }

                var table;
                if ($.fn.dataTable.isDataTable('#table-list-data')) {
                    table = $('#table-list-data').DataTable();
                    table.clear();
                    table.rows.add(dataSet);
                    table.order([0, 'dsc']);
                    table.draw();
                } else {
                    table = $('#table-list-data').DataTable({
                        "info": false,
                        "data": dataSet,
                        "paging": false,
                        "searching": false,
                        "bSort": false,
                        "columns": [{
                            "data": "id"
                        },
                        {
                            "data": "no"
                        },
                        {
                            "data": "location"
                        },
                        {
                            "data": "data_name"
                        },
                        {
                            "data": "category_name"
                        },
                        {
                            "data": "image"
                        },
                        {
                            "data": "action"
                        }
                        ],
                        "columnDefs": [{
                            "className": "dt-left",
                            "width": "0%",
                            "targets": 0,
                            "visible": false
                        },
                        {
                            "className": "dt-center",
                            "width": "50px",
                            "targets": 1
                        },
                        {
                            "className": "dt-left",
                            "width": "15%",
                            "targets": 2
                        },
                        {
                            "className": "dt-left",
                            "width": "20%",
                            "targets": 3
                        },
                        {
                            "className": "dt-left",
                            "width": "15%",
                            "targets": 4
                        },
                        {
                            "className": "dt-left",
                            "width": "20%",
                            "targets": 5
                        },
                        {
                            "className": "dt-center",
                            "width": "20%",
                            "targets": 6
                        },
                        ],
                        "dom": 'lfBrtip',
                        "buttons": [{
                            "targets": 0,
                            "className": "btn-none"
                        }]
                    });


                    table.order([0, 'dsc']);
                    table.draw();
                }

                this.CreatePaging();

                $("#loader-content").fadeOut("fast");
                $('div[name="loader-content-table"]').addClass('attr-display-none');
            } else {
                $("#loader-content").fadeOut("fast");
                $('div[name="loader-content-table"]').addClass('attr-display-none');

                if (results.error_code == "data_360_not_found") {
                    if ($.fn.dataTable.isDataTable('#table-list-data')) {
                        dataSet = [];
                        table = $('#table-list-data').DataTable();
                        table.clear();
                        table.rows.add(dataSet);
                        table.order([0, 'dsc']);
                        table.draw();
                    }

                    this.pageDataTotal = 0;
                    this.CreatePaging();
                    ApiService.ShowAlertContent("ERROR : Data yang dicari tidak ditemukan", false, results.error_code);
                } else {
                    ApiService.ShowAlertContent("ERROR : " + results.message, false, results.error_code);
                }

            }

        }.bind(this).bind(dataUser))
            .fail(function (xhr) {
                ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
            }.bind(this));

    }

    this.PostDataCheck = function () {
        var id = $('input[name="id-360"]').val();
        if (id == undefined || id == "") {
            this.PostAddData();
        } else {
            this.PostEditData();
        }
    }

    this.PostAddData = function () {
        var form = $('form[name="edit-add-data-form"]');

        if (!form.parsley().isValid()) {
            if (($('input[name="location"]').val() != '') &&
                ($('input[name="thumbnail"]').val() != '') &&
                ($('input[name="image"]').val() != '')) {
                event.preventDefault();
            }

            form.parsley().whenValid().done(function () {
                $('div[name="cont-btn-edit-add-data"]').addClass('attr-display-none');
                $('div[name="loading-edit-add-data"]').removeClass('attr-display-none');

                var dataUser = JSON.parse(Helper.GetCookie("data_user"));
                var fd = new Object();
                fd.id_data = data.id;
                fd.location = $('input[name="location"]').val();
                fd.name = data.name;
                fd.image = $('input[name="image"]')[0].files[0];
                fd.thumbnail = $('input[name="thumbnail"]')[0].files[0];


                var promise = ApiService.RestService("POST", "api/data", fd, dataUser.token);
                promise.done(function (data) {
                    var results = JSON.parse(data);

                    if (results.status == "SUCCESS") {
                        this.GetDataList();
                        modal = $("#modal-edit-add").modal();
                        modal.modal("hide");
                        ApiService.ShowAlertContent("SUCCESS : " + "Add data 360 berhasil", true);

                    } else {
                        Helper.ShowAlertModalEditAdd("ERROR : " + results.message, false, results.error_code);
                    }

                    $('div[name="cont-btn-edit-add-data"]').removeClass('attr-display-none');
                    $('div[name="loading-edit-add-data"]').addClass('attr-display-none');
                }.bind(this))
                    .fail(function (xhr) {
                        Helper.ShowAlertModalEditAdd("ERROR : " + ApiService.messageFailApiService, false);
                        $('div[name="cont-btn-edit-add-data"]').removeClass('attr-display-none');
                        $('div[name="loading-edit-add-data"]').addClass('attr-display-none');
                    }.bind(this));

            }.bind(DataList))
                .fail(function () {

                })
        }

    }

    this.PostEditData = function () {
        var form = $('form[name="edit-add-data-form"]');

        if (form.parsley().isValid()) {
            event.preventDefault();
            $('div[name="cont-btn-edit-add-data"]').addClass('attr-display-none');
            $('div[name="loading-edit-add-data"]').removeClass('attr-display-none');


            var dataUser = JSON.parse(Helper.GetCookie("data_user"));
            var fd = new Object();
            fd.id_360 = $('input[name="id-360"]').val();
            fd.id_data = $('input[name="id-data"]').val();
            fd.location = $('input[name="location"]').val();


            var promise = ApiService.RestService("POST", "api/data", fd, dataUser.token);
            promise.done(function (data) {

                var results = JSON.parse(data);
                if (results.status == "SUCCESS") {
                    this.GetDataList();
                    modal = $("#modal-edit-add").modal();
                    modal.modal("hide");
                    ApiService.ShowAlertContent("SUCCESS : " + "Edit data 360 berhasil", true);
                } else {
                    Helper.ShowAlertModalEditAdd("ERROR : " + results.message, false, results.error_code);
                }

                $('div[name="cont-btn-edit-add-data"]').removeClass('attr-display-none');
                $('div[name="loading-edit-add-data"]').addClass('attr-display-none');
            }.bind(this))
                .fail(function (xhr) {
                    Helper.ShowAlertModalEditAdd("ERROR : " + ApiService.messageFailApiService, false);
                    $('div[name="cont-btn-edit-add-data"]').removeClass('attr-display-none');
                    $('div[name="loading-edit-add-data"]').addClass('attr-display-none');
                }.bind(this));
        }
    }

    this.PostDeleteData = function () {
        $('div[name="cont-btn-delete-data"]').addClass('attr-display-none');
        $('div[name="loading-delete-data"]').removeClass('attr-display-none');

        var idData = $('input[name="id-delete-data"]').val();

        var dataUser = JSON.parse(Helper.GetCookie("data_user"));
        var fd = new Object();
        var promise = ApiService.RestService("DELETE", "api/data/" + idData, fd, dataUser.token);
        promise.done(function (data) {
            var results = JSON.parse(data);
            if (results.status == "SUCCESS") {

                modal = $("#modal-delete").modal();
                modal.modal("hide");
                ApiService.ShowAlertContent("SUCCESS : " + "Delete data 360 berhasil", true);
                this.GetDataList();
            } else {
                Helper.ShowAlertModalEditAdd("ERROR : " + results.message, false, results.error_code);
            }

            $('div[name="cont-btn-delete-data"]').removeClass('attr-display-none');
            $('div[name="loading-delete-data"]').addClass('attr-display-none');
        }.bind(this))
            .fail(function (xhr) {
                Helper.ShowAlertModalEditAdd("ERROR : " + ApiService.messageFailApiService, false);
                $('div[name="cont-btn-delete-data"]').removeClass('attr-display-none');
                $('div[name="loading-delete-data"]').addClass('attr-display-none');
            }.bind(this));
    }

    this.AddData = function () {
        $('#thumbnail').attr('src', '');
        $('#image').attr('src', '');
        $('input[name="id-360"]').attr("required", false);
        $('input[name="id-360"]').val("");
        $('div[name="cont-id-360"]').hide();
        $('input[name="id-data"]').attr("required", true);
        $('div[name="image"]').show();
        $('div[name="thumbnail"]').show();

        $('input[name="id-data"]').val(data.id);
        $('input[name="name"]').val(data.name);
        $('input[name="location"]').val("");
        $('input[name="image"]').val("");
        $('input[name="thumbnail"]').val("");

        $('h4[name="title-modal-form"]').html("Add Data 360");
        $('button[name="btn-submit"]').html("Add");

        modal = $("#modal-edit-add").modal();
        modal.modal("show");

        var form = $('form[name="edit-add-data-form"]');
        form.parsley().reset();

    }

    this.Edit = function (index) {
        $('input[name="id-360"]').attr("required", true);
        $('input[name="id-data"]').attr("required", true);
        $('input[name="image"]').attr("required", false);
        $('input[name="thumbnail"]').attr("required", false);

        $('input[name="image"]').val("");
        $('input[name="thumbnail"]').val("");

        $('input[name="id-360"]').val(dataSet[index].id);
        $('input[name="id-data"]').val(data.id);
        $('input[name="name"]').val(dataSet[index].data_name);
        $('input[name="location"]').val(dataSet[index].location);
        $('div[name="image"]').hide();
        $('div[name="thumbnail"]').hide();


        $('h4[name="title-modal-form"]').html("Edit Data");
        $('button[name="btn-submit"]').html("Edit");


        modal = $("#modal-edit-add").modal();
        modal.modal("show");

        var form = $('form[name="edit-add-data-form"]');
        form.parsley().reset();

    }

    this.Delete = function (index) {
        $('input[name="id-delete-data"]').val(dataSet[index].id);
        var message = "Apakah anda yakin akan menghapus <b>Data 360 " + dataSet[index].location + "?</b>";
        $('p[name="detail-delete"]').html(message);
        modal = $("#modal-delete").modal();
        modal.modal("show");
    }


    //==============
    //=== paging ===
    //==============

    this.pageOffset = 0;
    this.pageLimit = 10;
    this.pageDataTotal = 0;

    this.CreatePaging = function () {
        var totalPage = Math.ceil(this.pageDataTotal / this.pageLimit);

        if (totalPage != 0) {
            var maxNoPageDisplay = 0;
            if (totalPage > 6)
                maxNoPageDisplay = 6;
            else
                maxNoPageDisplay = totalPage;

            var currentPage = (this.pageOffset / this.pageLimit) + 1;
            var firstPage = 1;
            if (currentPage > 3)
                firstPage = currentPage - 3;

            var prevDisabled = "";
            if (currentPage == 1)
                prevDisabled = "disabled";



            maxNoPageDisplay = firstPage + maxNoPageDisplay;
            if (maxNoPageDisplay >= totalPage)
                maxNoPageDisplay = totalPage;

            var strPaging = "<li class='paginate_button previous " + prevDisabled + "'>" +
                "<a onclick='PageScript.ChangePage(" + (currentPage - 1) + "," + '"' + prevDisabled + '"' + ")' href='#' aria-controls='table-list-web-url'>Previous</a>" +
                "</li>";

            if (currentPage > 1) {
                strPaging += "<li class='paginate_button previous'>" +
                    "<a onclick='PageScript.ChangePage(" + (1) + "," + '""' + ")' href='#' aria-controls='table-list-web-url'>First Page</a>" +
                    "</li>";
            }


            for (var i = firstPage; i <= maxNoPageDisplay; i++) {
                var classActive = "";
                if (i == currentPage)
                    classActive = "active";

                var noPage = i;

                strPaging += "<li class='paginate_button " + classActive + "'>" +
                    "<a onclick='PageScript.ChangePage(" + noPage + "," + '""' + ")' href='#' aria-controls='table-list-web-url'>" + noPage + "</a>" +
                    "</li>";
            }

            var nextDisabled = "";
            if (currentPage == totalPage)
                nextDisabled = "disabled";

            if (currentPage < totalPage - 3) {
                strPaging += "<li class='paginate_button previous disabled'>" +
                    "<a onclick='PageScript.ChangePage(" + "" + "," + '"' + "sign" + '"' + ")' href='#' aria-controls='table-list-web-url'>...</a>" +
                    "</li>";
            }

            if (currentPage < totalPage - 3) {
                strPaging += "<li class='paginate_button previous'>" +
                    "<a onclick='PageScript.ChangePage(" + (totalPage) + "," + '""' + ")' href='#' aria-controls='table-list-web-url'>Last Page</a>" +
                    "</li>";
            }

            strPaging += "<li class='paginate_button next " + nextDisabled + "'>" +
                "<a onclick='PageScript.ChangePage(" + (maxNoPageDisplay) + "," + '"' + nextDisabled + '"' + ")' href='#' aria-controls='table-list-web-url'>Next</a>" +
                "</li>";
            $('ul[name="container-paging"]').html(strPaging);
        } else {
            $('ul[name="container-paging"]').html("");
        }
    }

    this.ChangePage = function (noPage, stat) {
        if (stat == "") {
            $('div[name="loader-content-table"]').removeClass('attr-display-none');

            this.pageOffset = (noPage * this.pageLimit) - this.pageLimit;
            this.GetDataList();
        }

    }

    this.ChangeSizePage = function () {
        if (this.pageLimit != $('select[name="size-table-page"]').val()) {
            this.pageLimit = $('select[name="size-table-page"]').val();

            $('div[name="loader-content-table"]').removeClass('attr-display-none');

            this.pageOffset = (1 * this.pageLimit) - this.pageLimit;
            this.GetDataList();
        }
    }

    //=================
    //=== filtering ===
    //=================
    this.stringFiltering = "";
    this.SetStringFiltering = function () {
        var search = $('input[name="filter-search"]').val();
        var strSearch = "";
        if (search != "") {
            strSearch = "&filter_name=" + search;
        }

        this.stringFiltering = strSearch;
    }
    this.GetIdData = function () {
        var id = "/" + window.location.search.substring(1);
        return id;
    }
    this.SearchData = function () {
        $('div[name="loader-content-table"]').removeClass('attr-display-none');
        this.SetStringFiltering();
        this.GetDataList();
    }

    //===============
    //=== sorting ===
    //===============
    this.stringSorting = "";
    this.locationDesc = false;
    this.SetStringSorting = function (colName) {
        this.SetInActiveIconSort();
        switch (colName) {
            case "location":
                if (this.locationDesc) {
                    this.locationDesc = false;
                    this.stringSorting = "&order=locationAsc";
                    this.SetIconSort("icon-asc-location", "icon-desc-location", "asc");
                } else {
                    this.locationDesc = true;
                    this.stringSorting = "&order=locationDesc";
                    this.SetIconSort("icon-asc-location", "icon-desc-location", "desc");
                }
                break;
            default:
                this.locationDesc = false;
                this.stringSorting = "&order=locationAsc";
                this.SetIconSort("icon-asc-location", "icon-desc-location", "asc");
                break;
        }
    }

    this.SortingData = function (colName) {
        $('div[name="loader-content-table"]').removeClass('attr-display-none');
        this.SetStringSorting(colName);
        this.GetDataList();
    }

    this.SetInActiveIconSort = function () {
        var arrIcon = [
            "icon-asc-location", "icon-asc-location",
            "icon-desc-location", "icon-desc-location"
        ]

        for (var i = 0; i < arrIcon.length; i++) {
            $('i[name="' + arrIcon[i] + '"]').addClass('icon-sorting-inactive');
            $('i[name="' + arrIcon[i] + '"]').removeClass('icon-sorting-active');
        }
    }

    this.SetIconSort = function (nameIconAsc, nameIconDesc, typeSort) {
        if (typeSort == "asc") {
            $('i[name="' + nameIconAsc + '"]').removeClass('icon-sorting-inactive');
            $('i[name="' + nameIconAsc + '"]').addClass('icon-sorting-active');

            $('i[name="' + nameIconDesc + '"]').addClass('icon-sorting-inactive');
            $('i[name="' + nameIconDesc + '"]').removeClass('icon-sorting-active');
        } else if (typeSort == "desc") {
            $('i[name="' + nameIconDesc + '"]').removeClass('icon-sorting-inactive');
            $('i[name="' + nameIconDesc + '"]').addClass('icon-sorting-active');

            $('i[name="' + nameIconAsc + '"]').addClass('icon-sorting-inactive');
            $('i[name="' + nameIconAsc + '"]').removeClass('icon-sorting-active');
        }
    }

    // ============
    // == Helper ==
    // ============

    this.formatDate = function (rdate) {
        // rdate format yyyy-mm-dd
        var date = new Date(rdate);
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return day + ' ' + monthNames[monthIndex] + ' ' + year;
    }

    this.EditImage = function (index) {
        let id_data, id_360;
        id_data = data.id;
        id_360 = dataSet[index].id;
        window.open('image360.html?' + id_data + '&' + id_360, '_self');
    }

    this.OpenUnityPage = function (index) {
        let id_data, id_360;
        id_data = data.id;
        id_360 = dataSet[index].id;
        window.open('unitypage.html?' + id_data + '&' + id_360, '_self');
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

    this.readURLthumb = function (input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#thumbnail').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    this.SetBreadcump = function () {

        var arrBreadcump = [{
            "name": "Home",
            "url": ApiService.urlDomain,
            "active": false
        },
        {
            "name": "Data",
            "url": ApiService.urlDomain + "data.html",
            "active": false
        },
        {
            "name": dataDetail.name,
            "url": "#",
            "active": true
        }
        ];
        Helper.SetBreadcump(arrBreadcump);
    }
}


$('input[name="image"]').change(function () {
    PageScript.readURL(this);
});

$('input[name="thumbnail"]').change(function () {
    PageScript.readURLthumb(this);
});