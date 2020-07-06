window.onload = function() {
    $(".wrap").css("min-height",$(window).height())
    $(".popup-wrap").css("height",$(".wrap").outerHeight())
    $(".popup-wrap").css("margin-bottom",-1*$(".wrap").outerHeight())
}

function cancelWin() {
    $(".popup-wrap").addClass("hide")
}

function confirmClicked() {
    $(".popup-wrap").removeClass("hide")
}