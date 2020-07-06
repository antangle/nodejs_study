window.onload = function() {
    $(".wrap").css("min-height",$(window).height())
}

function sort(clicked) {
    if ($(clicked).hasClass("select")){
        return
    }
    else if($(clicked).hasClass("recent")){
        $(".impending").removeClass("select")
        $(clicked).addClass("select")
        $(".sort-bottom-line").animate({'marginLeft': 13}, 150)
    }
    else if($(clicked).hasClass("impending")){
        $(".recent").removeClass("select")
        $(clicked).addClass("select")
        $(".sort-bottom-line").animate({'marginLeft': 84}, 150)
    }
}