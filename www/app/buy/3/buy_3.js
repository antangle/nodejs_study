function selectAgency(clicked) {
    var siblings = ".wrap .device-info-wrap .device-info .device-info-list-agency .device-info-row .device-info-item";
    var item = $(clicked).children(".device-info-item-txt")
    var agency = "#device_info_agency";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(agency).text(text+' 선택됨');
}


function selectAgencies(clicked) {
    var agencies = "#device_info_agencies";
    if ($(clicked).hasClass("select")) {
        $(clicked).removeClass("select");
    }
    else{
        $(clicked).addClass("select");
    }
    var selected = ".wrap .device-info-wrap .device-info .device-info-list-agencies .device-info-row .device-info-item.select";
    var item = $(selected).children(".device-info-item-txt")
    var text = $(item).text();
    $(agencies).text(text+' 선호');
    if (!text) {
        $(agencies).text('선택된 통신사가 없습니다.');
    }
}

function selectPeriod(clicked) {
    var siblings = $(".wrap .device-info-wrap .device-info .device-info-list-period .device-info-row").children();
    var item = $(clicked).children(".device-info-item-txt")
    var period = "#device_info_period";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(period).text(text+' 선택됨');
}

function extraInfoClicked() {
    var arrow = ".wrap .extra-info-wrap .extra-info-btn";
    var descript = ".wrap .extra-info-wrap .extra-info-content";
    var more = ".wrap .extra-info-wrap .extra-info-choice";
    if ($(arrow).hasClass("close")) {
        $(arrow).removeClass("close");
        $(descript).removeClass("show");
        $(descript).addClass("hide");
        $(more).removeClass("hide");
        $(more).addClass("show");
    }
    else{
        $(arrow).addClass("close");
        $(descript).removeClass("hide");
        $(descript).addClass("show");
        $(more).removeClass("show");
        $(more).addClass("hide");
    }
}

function selectAgreement(clicked) {
    var siblings = $(".wrap .extra-info-wrap .device-info .device-info-list-agreement .device-info-row").children();
    var item = $(clicked).children(".device-info-item-txt")
    var agreement = "#device_info_agreement";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(agreement).text(text+' 선택됨');
}

function selectAgreePeriod(clicked) {
    var siblings = $(".wrap .extra-info-wrap .device-info .device-info-list-agreement-period .device-info-row").children();
    var item = $(clicked).children(".device-info-item-txt")
    var period = "#device_info_agreement_period";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(period).text(text+' 선택됨');
}

function selectReturn(clicked) {
    var siblings = $(".wrap .extra-info-wrap .device-info .device-info-list-return .device-info-row").children();
    var item = $(clicked).children(".device-info-item-txt")
    var back = "#device_info_return";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(back).text(text+' 선택됨');
}

function selectHigh(clicked) {
    var siblings = $(".wrap .extra-info-wrap .device-info .device-info-list-high-agreement .device-info-row").children();
    var item = $(clicked).children(".device-info-item-txt")
    var high = "#device_info_high_agreement";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(high).text(text+' 선택됨');
}

function selectCard(clicked) {
    var siblings = $(".wrap .extra-info-wrap .device-info .device-info-list-card .device-info-row").children();
    var item = $(clicked).children(".device-info-item-txt")
    var card = "#device_info_card";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(card).text(text+' 선택됨');
}

window.onload = function() {
    $(".wrap .top-wrap .top-bar .top-bar-red").animate({'width':'59.1%'},600)
    $(".wrap .top-wrap .top-bar .top-bar-man").animate({'left':'56%'},600)
}