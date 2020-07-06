window.onload = function() {
    $(".wrap").css("min-height",$(window).height());
    $(".location-select-wrap").css("height",$(document).height())
    $(".later-noti-wrap").css("height",$(document).height())
}

function selectProvince() {
    var selectWrap = ".location-select-wrap"
    var provinceTxt = ".wrap .location-wrap .location-find-wrap .location-value .location-province .location-province-txt"
    var selectProvinceWrap = ".wrap .location-select-wrap .location-select-province"
    if(!$(provinceTxt).hasClass("select")){
        $(provinceTxt).addClass("select")
        $(".location-district").removeClass("hide")
    }
    $(selectProvinceWrap).removeClass("hide")
    $(selectWrap).removeClass("hide")
}

function provinceItem(clicked) {
    var selectWrap = ".location-select-wrap"
    var provinceTxt = ".wrap .location-wrap .location-find-wrap .location-value .location-province .location-province-txt"
    var selectProvinceWrap = ".wrap .location-select-wrap .location-select-province"
    if (!$(clicked).hasClass("select")){
        districtInitialize()
    }
    $(clicked).siblings(".select").removeClass("select")
    $(clicked).addClass("select")
    $(selectProvinceWrap).addClass("hide")
    $(selectWrap).addClass("hide")
    $(provinceTxt).text($(clicked).children(".location-select-item-name").text())
}

function districtInitialize() {
    var districtTxt = ".wrap .location-wrap .location-find-wrap .location-value .location-district .location-district-txt"
    var districtItems = ".wrap .location-select-wrap .location-select-district .location-select-list .location-select-item"
    $(districtTxt).removeClass("select")
    $(districtTxt).text("시/군/구 선택")
    $(districtItems).siblings(".select").removeClass("select")
}

function selectDistrict() {
    var selectWrap = ".location-select-wrap"
    var districtTxt = ".wrap .location-wrap .location-find-wrap .location-value .location-district .location-district-txt"
    var selectDistrictWrap = ".wrap .location-select-wrap .location-select-district"
    if(!$(districtTxt).hasClass("select")){
        $(districtTxt).addClass("select")
    }
    $(selectDistrictWrap).removeClass("hide")
    $(selectWrap).removeClass("hide")
}

function districtItem(clicked) {
    var selectWrap = ".location-select-wrap"
    var districtTxt = ".wrap .location-wrap .location-find-wrap .location-value .location-district .location-district-txt"
    var selectDistrictWrap = ".wrap .location-select-wrap .location-select-district"
    $(clicked).siblings(".select").removeClass("select")
    $(clicked).addClass("select")
    $(selectDistrictWrap).addClass("hide")
    $(selectWrap).addClass("hide")
    $(districtTxt).text($(clicked).children(".location-select-item-name").text())
}

function laterNoti() {
    $(".later-noti-wrap").removeClass("hide")
}

function setNow() {
    $(".later-noti-wrap").addClass("hide")
}