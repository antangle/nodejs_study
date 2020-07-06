window.onload = function() {
    $(".wrap .container").css("min-height",$(window).height())
}

function selectTime(clicked) {
    var siblings = ".wrap .add-time-wrap .add-time-list .add-time-row .add-time-item";
    var item = $(clicked).children(".add-time-item-txt")
    var time = "#add-time";
    if ($(siblings).hasClass("select")) {
        $(siblings).removeClass("select");
        $(clicked).addClass("select");
    }
    var text = $(item).text();
    $(time).text(text+' 추가');
}
