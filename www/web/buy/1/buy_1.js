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
    $(".wrap .top-wrap .top-bar .top-bar-red").animate({'width':'19.7%'},600)
    $(".wrap .top-wrap .top-bar .top-bar-man").animate({'left':'16.5%'},600)
}