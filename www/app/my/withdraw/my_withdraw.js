window.onload = function() {
    $(".wrap .container").css("min-height",$(window).height())
}

function agree(clicked) {
    if( $(clicked).hasClass("agreed") ){
        $(clicked).removeClass("agreed");
    }
    else{
        $(clicked).addClass("agreed");
    }
}