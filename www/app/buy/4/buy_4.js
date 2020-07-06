function selectSecret(clicked) {
    var siblings = ".wrap .device-info-wrap .device-info .device-info-list-secret .device-info-row .device-info-item";
    var item = $(clicked).children(".device-info-item-txt")
    var secret = "#device_info_secret";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(secret).text('안심번호 '+text);
}

function selectTime(clicked) {
    var siblings = ".wrap .device-info-wrap .device-info .device-info-list-time .device-info-row .device-info-item";
    var item = $(clicked).children(".device-info-item-txt")
    var time = "#device_info_time";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(time).text(text+' 선택됨');
}

window.onload = function() {
    $(".wrap").css("min-height",$(window).height())
    $(".wrap .container").css("min-height","942px")
    $(".wrap .top-wrap .top-bar .top-bar-red").animate({'width':'76.1%'},600)
    $(".wrap .top-wrap .top-bar .top-bar-man").animate({'left':'73.5%'},600)
}