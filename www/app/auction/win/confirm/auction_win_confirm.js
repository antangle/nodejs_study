window.onload = function() {
    $(".popup-wrap").css("height",$(".wrap").height())
    $(".popup-wrap").css("margin-bottom",-1*$(".wrap").height())
}

function cancelWin() {
    $(".popup-wrap").addClass("hide")
}

function confirmClicked() {
    $(".popup-wrap").removeClass("hide")
}