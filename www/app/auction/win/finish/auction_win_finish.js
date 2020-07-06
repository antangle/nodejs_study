function showDetail() {
    $(".bid-foot").removeClass("hide");
    $(".bid-content").removeClass("hide");
    $(".bid-foot-small").addClass("hide");
    $(".bid-content-small").addClass("hide");
}

window.onload = function() {
    $(".wrap").css("min-height",$(window).height())
}