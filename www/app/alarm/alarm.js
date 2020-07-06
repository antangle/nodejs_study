window.onload = function() {
    $(".wrap").css("min-height",$(window).height())
}

function userClicked() {
    if($(".service").hasClass("select")){
        $(".service").removeClass("select")
        $(".user").addClass("select")
    }
}

function serviceClicked() {
    if($(".user").hasClass("select")){
        $(".user").removeClass("select")
        $(".service").addClass("select")
    }
}