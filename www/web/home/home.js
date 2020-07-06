function showSellRank() {
    var toprank = ".wrap .sell-rank-wrap .sell-rank-top";
    var ranklist = ".wrap .sell-rank-wrap .sell-rank-list"
    $(toprank).removeClass("show");
    $(toprank).addClass("hide");
    $(ranklist).removeClass("hide");
    $(ranklist).addClass("show");
}

function hideSellRank() {
    var toprank = ".wrap .sell-rank-wrap .sell-rank-top";
    var ranklist = ".wrap .sell-rank-wrap .sell-rank-list"
    $(toprank).removeClass("hide");
    $(toprank).addClass("show");
    $(ranklist).removeClass("show");
    $(ranklist).addClass("hide");
}

window.onload = function() {
    $(".wrap .footer-wrap .menu-item.home").addClass("select")
}