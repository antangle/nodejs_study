function selectPhone(clicked) {
    var siblings = ".wrap .brand-device-wrap .brand-device-list .brand-device-row .brand-device-item";
    var item = $(clicked).children(".brand-device-item-name")
    var newDevice = ".wrap .brand-device-wrap .brand-device-select .brand-device-select-txt";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(newDevice).text(text+' 선택됨');
}


function brandClicked(clicked, num) {
    var brands = ".wrap .brand-device-wrap .brand-list .brand-item";
    if ($(brands).hasClass("selected")) {
        $(brands).removeClass("selected");
        $(clicked).addClass("selected");
    }
}

window.onload = function() {
    $(".wrap .brand-device-wrap .brand-list").css("width",$(".wrap").width())
}

$( window ).resize( function() {
    $(".wrap .brand-device-wrap .brand-list").css("width",$(".wrap").width());
})

window.onload = function() {
    $(".wrap").css("min-height",$(window).height())
    $(".wrap .container").css("min-height","906px")
}