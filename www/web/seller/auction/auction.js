window.onload = function() {
    $(".wrap").css("min-height",$(window).height())
}

function select(clicked) {
    $(".choice").removeClass("select");
    $(clicked).addClass("select")
    if ($(clicked).hasClass("ongoing-deal") && $(".ongoing-deal-wrap").hasClass("hide")){
        $(".ongoing-deal-wrap").removeClass("hide")
        $(".last-deal-wrap").addClass("hide")
    }
    if ($(clicked).hasClass("last-deal") && $(".last-deal-wrap").hasClass("hide")){
        $(".ongoing-deal-wrap").addClass("hide")
        $(".last-deal-wrap").removeClass("hide")
    }
}