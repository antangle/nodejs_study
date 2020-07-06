function selectPhone(clicked) {
    var siblings = ".wrap .new-device-wrap .new-device-list .new-device-row .new-device-item";
    var item = $(clicked).children(".new-device-item-name")
    var newDevice = ".wrap .new-device-wrap .new-device-select .new-device-select-txt";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(newDevice).text(text+' 선택됨');
}

window.onload = function() {
    $(".wrap").css("min-height",$(window).height())
    $(".wrap .container").css("min-height","769px")
}