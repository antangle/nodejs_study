window.onload = function() {
    $(".wrap").css("min-height",$(window).height())
}

function detailDeal(clicked) {
    var detailText = $(clicked).children(".last-deal-content").children(".last-deal-see-detail")
    var detail = $(clicked).children(".last-deal-detail")
    if($(clicked).hasClass("active")){
        $(clicked).removeClass("active")
        $(detailText).text("경매 내용 보기")
        $(detail).addClass("hide")
    }else{
        $(clicked).addClass("active")
        $(detailText).text("경매 내용 숨기기")
        $(detail).removeClass("hide")
    }
}