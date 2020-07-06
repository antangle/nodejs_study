function agreeAll(clicked) {
    if( $(clicked).hasClass("agreed") ){
        $(".agree-btn").removeClass("agreed");
    }
    else{
        $(".agree-btn").addClass("agreed");
    }
}

function agreeThis(clicked) {
    if( $(clicked).hasClass("agreed") ){
        $(clicked).removeClass("agreed");
        $(".agree-list.all .agree-btn").removeClass("agreed");
    }
    else{
        $(clicked).addClass("agreed");
        if($(".agree-btn.agreed").length==3){
            $(".agree-list.all .agree-btn").addClass("agreed");
        }
    }
}

function dropDown(clicked) {
    var content = $(clicked).siblings(".agree-content");
    if($(clicked).hasClass("down")){
        $(clicked).removeClass("down");
        $(content).addClass("hide");
    }
    else{
        $(clicked).addClass("down");
        $(content).removeClass("hide");
    }
}

window.onload = function() {
    $(".wrap").css("min-height",$(window).height()-80)
}