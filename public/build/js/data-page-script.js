var dataSet = [];
var categorySet = [];
$(document).ready(function () {
    PageScript.GetCategoryList();
    PageScript.GetList();

    var arrBreadcump = [{
        "name": "Home",
        "url": ApiService.urlDomain,
        "active": false
    },
    {
        "name": "List Data",
        "url": "#",
        "active": true
    }
    ];
    Helper.SetBreadcump(arrBreadcump);
});



var PageScript = new function () {

    this.GetList = function () {
        var dataUser = JSON.parse(Helper.GetCookie("data_user"));
        var fd = new Object();
        var apiUrl = "api/data" + "?offset=" + this.pageOffset + "&limit=" + this.pageLimit + this.stringFiltering + this.stringSorting;
        apiUrl = "dummy_data_list.json";
        var promise = ApiService.RestService("GET", apiUrl, fd, dataUser.token);
        promise.done(function (data) {
            if(ApiService.use_dummy_data){data = JSON.stringify(data)}
            var results = JSON.parse(data);
            if (results.status == "SUCCESS") {
                this.pageDataTotal = results.dataTotal;
                var itemNo = this.pageOffset;
                dataSet = results.data;
                for (var i = 0; i < dataSet.length; i++) {
                    dataSet[i].action = "" +
                        "<button class='btn btn-primary btn-xs btn-action-table'onclick='PageScript.DetailData(" + i + ")'><i class='fa fa-folder'></i> Detail Data</button>" +
                        "<button class='btn btn-success btn-xs btn-action-table' onclick='PageScript.Edit(" + i + ")'><i class='fa fa-pencil-square-o'></i> Edit</button>" +
                        "<button class='btn btn-danger btn-xs btn-action-table' onclick='PageScript.Delete(" + i + ")'><i class='fa fa-trash-o'></i> Hapus</button>";

                    itemNo += 1;
                    dataSet[i].no = itemNo + ".";
                    dataSet[i].isfreetxt = (dataSet[i].is_free == 1 ? "Free" : "Not free");
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
                            "data": "name"
                        },
                        {
                            "data": "description"
                        },
                        {
                            "data": "category_name"
                        },
                        {
                            "data": "isfreetxt"
                        },
                        {
                            "data": "data_date"
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
                            "width": "10%",
                            "targets": 2
                        },
                        {
                            "className": "dt-left",
                            "width": "20%",
                            "targets": 3
                        },
                        {
                            "className": "dt-left",
                            "width": "10%",
                            "targets": 4
                        },
                        {
                            "className": "dt-left",
                            "width": "70px",
                            "targets": 5
                        },
                        {
                            "className": "dt-left",
                            "width": "90px",
                            "targets": 6
                        },
                        {
                            "className": "dt-center",
                            "width": "20%",
                            "targets": 7
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

                if (results.error_code == "data_not_found") {
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
        var id = $('input[name="id-data"]').val();
        if (id == undefined || id == "") {
            this.PostAddData();
        } else {
            this.PostEditData();
        }
    }

    this.PostAddData = function () {
        var form = $('form[name="edit-add-data-form"]');

        if (($('select[name="id-category"]').val() != '') &&
            ($('input[name="name-data"]').val() != '') &&
            ($('textarea[name="description"]').val() != '') &&
            ($('input[name="data-date"]').val() != '') &&
            ($('input[name="image"]').val() != '')) {

            event.preventDefault();
        }

        console.log($('input[name="name"]').val())
        form.parsley().whenValid().done(function () {

            $('div[name="cont-btn-edit-add-data"]').addClass('attr-display-none');
            $('div[name="loading-edit-add-data"]').removeClass('attr-display-none');

            var dataUser = JSON.parse(Helper.GetCookie("data_user"));
            var fd = new Object();
            fd.id_category = $('select[name="id-category"]').val();
            fd.name = $('input[name="name-data"]').val();
            fd.description = $('textarea[name="description"]').val();
            fd.image = $('input[name="image"]')[0].files[0];
            fd.data_date = $('input[name="data-date"]').val();
            if ($('input[name="isfree"]').is(':checked')) {
                fd.is_free = 1;
            } else {
                fd.is_free = 0;
            }

            var promise = ApiService.RestService("POST", "api/data", fd, dataUser.token);
            promise.done(function (data) {
                
                var results = JSON.parse(data);
                if (results.status == "SUCCESS") {
                    this.GetList();
                    modal = $("#modal-edit-add").modal();
                    modal.modal("hide");
                    ApiService.ShowAlertContent("SUCCESS : " + "Add data berhasil", true);
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

    this.PostEditData = function () {        
        var form = $('form[name="edit-add-data-form"]');

        // if (form.parsley().isValid() || form.parsley().isValid() != null) {
            if (($('input[name="name-data"]').val() != '') &&
                ($('textarea[name="description"]').val() != '') &&
                ($('input[name="data-date"]').val() != '')) {

                event.preventDefault();
            }

            form.parsley().whenValid().done(function () {
                $('div[name="cont-btn-edit-add-data"]').addClass('attr-display-none');
                $('div[name="loading-edit-add-data"]').removeClass('attr-display-none');

                var dataUser = JSON.parse(Helper.GetCookie("data_user"));
                var fd = new Object();
                fd.id_data = $('input[name="id-data"]').val();
                fd.id_category = $('select[name="id-category"]').val();
                fd.name = $('input[name="name-data"]').val();
                fd.description = $('textarea[name="description"]').val();
                fd.image = $('input[name="image"]')[0].files[0];
                fd.data_date = $('input[name="data-date"]').val();
                if ($('input[name="isfree"]').is(':checked')) {
                    fd.is_free = 1;
                } else {
                    fd.is_free = 0;
                }
                var promise = ApiService.RestService("POST", "api/data", fd, dataUser.token);
                promise.done(function (data) {

                    var results = JSON.parse(data);
                    if (results.status == "SUCCESS") {
                        this.GetList();

                        modal = $("#modal-edit-add").modal();
                        modal.modal("hide");
                        ApiService.ShowAlertContent("SUCCESS : " + "Edit data berhasil", true);
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
                .fail(function () { })
        // }
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

                this.GetList();

                modal = $("#modal-delete").modal();
                modal.modal("hide");
                ApiService.ShowAlertContent("SUCCESS : " + "Delete data berhasil", true);
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
        $('select[name="id-category"]').prop("selectedIndex", "-99");

        $('button[name="btn-submit"]').html("Add");
        $('div[name="cont-id-data"]').hide();
        $('input[name="id-data"]').prop("required", false);
        $('input[name="id-data"]').val('');
        $('img[name="image"').removeAttr('src');
        $('input[name="image"').prop('required', true);
        $('select[name="id-category"]').removeAttr('disabled');
        $('span[name="image"').show();
        $('input[name="isfree"]').prop('checked', true);
        // $('input[name="isfree"]').removeAttr('data-parsley-multiple');

        $('select[name="id-category"]').val("");
        $('input[name="name-data"]').val("");
        $('textarea[name="description"]').val("");
        $('input[name="image"]').val("");
        $('input[name="data-date"]').val("");
        $('.selectpicker').selectpicker('refresh');

        $('h4[name="title-modal-form"]').html("Add Data");

        modal = $("#modal-edit-add").modal();
        modal.modal("show");

        var form = $('form[name="edit-add-data-form"]');
        form.parsley().reset();

    }

    this.Edit = function (index) {
        // $('.selectpicker').prop('disabled', true);

        $('img[name="image"').removeClass('hidden');
        $('input[name="id-data"]').attr("required", true);
        $('button[name="btn-submit"]').html("Edit");
        $('input[name="image"').prop('required', false);
        // $('select[name="id-category"]').attr('disabled', 'disabled');
        // $('select[name="id-category"]').removeAttr('disabled');

        $('span[name="image"').hide();

        $('input[name="id-data"]').val(dataSet[index].id);
        $('select[name="id-category"]').val(dataSet[index].id_category);
        $('input[name="name-data"]').val(dataSet[index].name);
        $('img[name="image"]').prop('src', dataSet[index].imagethumb_url);
        $('input[name="image"').val('');
        $('textarea[name="description"]').val(dataSet[index].description);
        $('input[name="data-date"]').val(dataSet[index].data_date);

        if (dataSet[index].is_free == 1) {
            $('input[name="isfree"]').prop('checked', true);
        } else {
            $('input[name="isfree"]').removeAttr('checked');
        }

        $('.selectpicker').selectpicker('refresh');


        $('h4[name="title-modal-form"]').html("Edit Data");

        modal = $("#modal-edit-add").modal();
        modal.modal("show");

        var form = $('form[name="edit-add-data-form"]');
        form.parsley().reset();

    }

    this.Delete = function (index) {
        $('input[name="id-delete-data"]').val(dataSet[index].id);
        var message = "Apakah anda yakin akan menghapus <b>Data " + dataSet[index].name + "?</b>";
        $('p[name="detail-delete"]').html(message);
        modal = $("#modal-delete").modal();
        modal.modal("show");
    }

    this.GetCategoryList = function () {
        var filterCategory = "";
        var dataUser = JSON.parse(Helper.GetCookie("data_user"));
        var fd = new Object();
        var apiUrl = "api/category" + "?offset=" + this.pageOffset + "&limit=100" + filterCategory + this.stringSorting;
        if(ApiService.use_dummy_data){ apiUrl = "dummy_category_list.json";}
        var resultFilter = "";
        var resultFilter2 = "";
        var promise = ApiService.RestService("GET", apiUrl, fd, dataUser.token);

        promise.done(function (data) {
            if(ApiService.use_dummy_data){data = JSON.stringify(data)}
            var results = JSON.parse(data);
            if (results.status == "SUCCESS") {
                var categorySet = results.data;

                for (var i = 0; i < results.data.length; i++) {
                    resultFilter += '<option value=' + categorySet[i].id + '>' +
                        categorySet[i].name + '</option>';
                }

            } else {
                resultFilter = "<br>ERROR : " + ApiService.messageFailApiService;
            }

            SetCategoryOpt = function () {
                $('select[name="id-category"]').html(resultFilter);
            };

            $.when(SetCategoryOpt()).done(function () {
                $(".selectpicker").selectpicker('refresh');
            })


        }.bind(this).bind(dataUser))
            .fail(function (xhr) {
                ApiService.ShowAlertContent("ERROR : " + ApiService.messageFailApiService, false);
            }.bind(this));
    }

    this.DetailData = function (index) {
        window.open('detaildata.html?' + dataSet[index].id, '_self');
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
            this.GetList();
        }

    }

    this.ChangeSizePage = function () {
        if (this.pageLimit != $('select[name="size-table-page"]').val()) {
            this.pageLimit = $('select[name="size-table-page"]').val();

            $('div[name="loader-content-table"]').removeClass('attr-display-none');

            this.pageOffset = (1 * this.pageLimit) - this.pageLimit;
            this.GetList();
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
            var selectFilter = $('select[name="filter-search"]').val();
            switch (selectFilter) {
                case 'name':
                    strSearch = "&filter_name=" + search;
                    break;
                case 'category':
                    strSearch = "&filter_category=" + search;
                    break;
                default:
                    strSearch = "&filter_title=";
                    break;
            }
        }

        this.stringFiltering = strSearch;
    }

    this.SearchData = function () {
        $('div[name="loader-content-table"]').removeClass('attr-display-none');
        this.SetStringFiltering();
        this.GetList();
        $('span[id="searchclear"]').show();

    }

    this.ChangeFilterForm = function () {
        var selectFilter = $('select[name="filter-search"]').val();
        if (selectFilter == 'date') {
            $('input[name="filter-search"]').attr('type', 'date');
        } else {
            $('input[name="filter-search"]').attr('type', 'text');
        }
    }

    this.ClearSearch = function () {
        $('input[name="filter-search"]').val('');
        $('span[id="searchclear"]').hide();
        this.stringFiltering = "&filter_name=";
        this.GetList();
    }

    //===============
    //=== sorting ===
    //===============
    this.stringSorting = "";
    this.nameDesc = false;
    this.descriptionDesc = false;
    this.categoryDesc = false;
    this.freeDesc = false;
    this.dateDesc = false;
    this.SetStringSorting = function (colName) {
        this.SetInActiveIconSort();
        switch (colName) {
            case "name":
                if (this.nameDesc) {
                    this.nameDesc = false;
                    this.stringSorting = "&order=nameAsc";
                    this.SetIconSort("icon-asc-name", "icon-desc-name", "asc");
                } else {
                    this.nameDesc = true;
                    this.stringSorting = "&order=nameDesc";
                    this.SetIconSort("icon-asc-name", "icon-desc-name", "desc");
                }
                break;

            case "description":
                if (this.descriptionDesc) {
                    this.descriptionDesc = false;
                    this.stringSorting = "&order=descriptionAsc";
                    this.SetIconSort("icon-asc-description", "icon-desc-description", "asc");
                } else {
                    this.descriptionDesc = true;
                    this.stringSorting = "&order=descriptionDesc";
                    this.SetIconSort("icon-asc-description", "icon-desc-description", "desc");
                }
                break;


            case "id_category":
                if (this.categoryDesc) {
                    this.categoryDesc = false;
                    this.stringSorting = "&order=categoryAsc";
                    this.SetIconSort("icon-asc-category", "icon-desc-category", "asc");
                } else {
                    this.categoryDesc = true;
                    this.stringSorting = "&order=categoryDesc";
                    this.SetIconSort("icon-asc-category", "icon-desc-category", "desc");
                }
                break;

            case "is_free":
                if (this.freeDesc) {
                    this.freeDesc = false;
                    this.stringSorting = "&order=freeAsc";
                    this.SetIconSort("icon-asc-isfree", "icon-desc-isfree", "asc");
                } else {
                    this.freeDesc = true;
                    this.stringSorting = "&order=freeDesc";
                    this.SetIconSort("icon-asc-isfree", "icon-desc-isfree", "desc");
                }
                break;

            case "data_date":
                if (this.dateDesc) {
                    this.dateDesc = false;
                    this.stringSorting = "&order=dateAsc";
                    this.SetIconSort("icon-asc-date", "icon-desc-date", "asc");
                } else {
                    this.dateDesc = true;
                    this.stringSorting = "&order=dateDesc";
                    this.SetIconSort("icon-asc-date", "icon-desc-date", "desc");
                }
                break;
            default:
                this.idDesc = true;
                this.stringSorting = "&order=idDesc";
                this.SetIconSort("icon-asc-id", "icon-desc-id", "desc");
                break;
        }
    }

    this.SortingData = function (colName) {
        $('div[name="loader-content-table"]').removeClass('attr-display-none');
        this.SetStringSorting(colName);
        this.GetList();
    }

    this.SetInActiveIconSort = function () {
        var arrIcon = [
            "icon-asc-username", "icon-asc-description",
            "icon-asc-name", "icon-asc-name",
            "icon-asc-email", "icon-asc-category",
            "icon-asc-register", "icon-asc-isfree",
            "icon-asc-phone", "icon-asc-date",
            "icon-desc-username", "icon-desc-description",
            "icon-desc-name", "icon-desc-name",
            "icon-desc-email", "icon-desc-category",
            "icon-desc-register", "icon-desc-isfree",
            "icon-asc-phone", "icon-asc-date"
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


$('input[name="image"]').change(function () {
    PageScript.readURL(this);
});