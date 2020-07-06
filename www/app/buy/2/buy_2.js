function selectColor(clicked) {
    var siblings = ".wrap .device-info-wrap .device-info .device-info-list-color .device-info-row .device-info-item";
    var item = $(clicked).children(".device-info-item-txt")
    var color = "#device_info_color";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(color).text(text+' 선택됨');
}

function selectVolume(clicked) {
    var siblings = ".wrap .device-info-wrap .device-info .device-info-list-volume .device-info-row .device-info-item";
    var item = $(clicked).children(".device-info-item-txt")
    var color = "#device_info_volume";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(color).text(text+' 선택됨');
}

window.onload = function() {
    $(".wrap").css("min-height",$(window).height())
    $(".wrap .container").css("min-height","769px")
    $(".wrap .top-wrap .top-bar .top-bar-red").animate({'width':'39.4%'},600)
    $(".wrap .top-wrap .top-bar .top-bar-man").animate({'left':'36%'},600)
}