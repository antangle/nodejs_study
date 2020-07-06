window.onload = function() {
    $(".first").children(".bid-card-rank-icon").html("<img src=\"/common/res/icon/mybid-preference-ranking-1-st@2x.png\"srcset=\"/common/res/icon/mybid-preference-ranking-1-st@2x.png 2x\,/common/res/icon/mybid-preference-ranking-1-st@3x.png 3x\"/>")
    $(".second").children(".bid-card-rank-icon").html("<img src=\"/common/res/icon/mybid-preference-ranking-2-nd@2x.png\"srcset=\"/common/res/icon/mybid-preference-ranking-2-nd@2x.png 2x\,/common/res/icon/mybid-preference-ranking-2-nd@3x.png 3x\"/>")
    $(".third").children(".bid-card-rank-icon").html("<img src=\"/common/res/icon/mybid-preference-ranking-3-rd@2x.png\"srcset=\"/common/res/icon/mybid-preference-ranking-3-rd@2x.png 2x\,/common/res/icon/mybid-preference-ranking-3-rd@3x.png 3x\"/>")
    $(".wrap").css("min-height",$(window).outerHeight())
    $(".popup-wrap").css("height",$(".wrap").outerHeight())
    $(".popup-wrap").css("margin-bottom",-1*$(".wrap").outerHeight())
}

function displayChange() {
    var listed = ".wrap .bid-wrap .bid-list"
    var packed = ".wrap .bid-wrap .bid-pack"
    if ($(listed).hasClass("hide")){
        $(listed).removeClass("hide")
        $(packed).addClass("hide")
    }else{
        $(listed).addClass("hide")
        $(packed).removeClass("hide")
    }
}

var popup = ".wrap .popup-wrap";

function sellerInfo(seller) {
    $(popup).removeClass("hide")
}

function closeInfo(){
    $(popup).addClass("hide")
}