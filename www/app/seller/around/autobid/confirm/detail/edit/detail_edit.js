window.onload = function() {
    $(".wrap").css("min-height",$(window).height())
}

function select(clicked) {
    if (!$(clicked).hasClass("select")) {
        $(clicked).siblings().removeClass("select");
        $(clicked).addClass("select");
    }
}
