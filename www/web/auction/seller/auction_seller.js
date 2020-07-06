window.onload = function() {
    $(".wrap").css("min-height",$(window).height())
    $(".popup-wrap").css("height",$(".wrap").height())
    $(".popup-wrap").css("margin-bottom",-1*$(".wrap").height())
}