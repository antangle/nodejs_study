window.onload = function() {
    $(".first").children(".bid-card-rank-icon").html("<img src=\"/common/res/icon/mybid-preference-ranking-1-st@2x.png\"srcset=\"/common/res/icon/mybid-preference-ranking-1-st@2x.png 2x\,/common/res/icon/mybid-preference-ranking-1-st@3x.png 3x\"/>")
    $(".second").children(".bid-card-rank-icon").html("<img src=\"/common/res/icon/mybid-preference-ranking-2-nd@2x.png\"srcset=\"/common/res/icon/mybid-preference-ranking-2-nd@2x.png 2x\,/common/res/icon/mybid-preference-ranking-2-nd@3x.png 3x\"/>")
    $(".third").children(".bid-card-rank-icon").html("<img src=\"/common/res/icon/mybid-preference-ranking-3-rd@2x.png\"srcset=\"/common/res/icon/mybid-preference-ranking-3-rd@2x.png 2x\,/common/res/icon/mybid-preference-ranking-3-rd@3x.png 3x\"/>")
    $(".wrap .container").css("min-height",$(window).height())
}