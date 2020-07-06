window.onload = function() {
    $(".wrap").css("min-height",$(window).height());
}

function activate(clicked) {
    if($(clicked).hasClass("select")){
        $(clicked).removeClass("select")
        $(clicked).children(".btn-slider").animate({'marginLeft': 0},150)
    }
    else{
        $(clicked).addClass("select")
        $(clicked).children(".btn-slider").animate({'marginLeft': 20},150)
    }
}