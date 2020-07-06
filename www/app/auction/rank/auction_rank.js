var rank = new Array();

function addRank(length,target,clicked) {
    if (length==0){
        $(target).addClass("first");
        $(clicked).addClass("first");
    }
    if (length==1){
        $(target).addClass("second");
        $(clicked).addClass("second");
    }
    if (length==2){
        $(target).addClass("third");
        $(clicked).addClass("third");
    }
}

function removeRank(check) {
    if (check==0){
        $(".first").removeClass("first");
        $(".second").addClass("first");
        $(".second").removeClass("second");
        $(".third").addClass("second");
        $(".third").removeClass("third");
    }
    if (check==1){
        $(".second").removeClass("second");
        $(".third").addClass("second");
        $(".third").removeClass("third");
    }
    if (check==2){
        $(".third").removeClass("third");
    }
}

function texting() {
    $(".bid-card-rank.first").text("1")
    $(".bid-card-rank.second").text("2")
    $(".bid-card-rank.third").text("3")
}

function cardClick(clicked, num) {
    var check = -1;
    var target = $(clicked).children(".bid-card-rank");
    for(i=0; i<rank.length; i++){
        if (num == rank[i]){
            check = i;
        }
    }
    console.log(check, rank.length)
    if (check !=-1){
        removeRank(check);
        rank.splice(check,1);
    }
    else if(rank.length<3){
        addRank(rank.length,target,clicked);
        rank.push(num);
    }
    else if(rank.length=3){
        alert("최대 3위 까지만 설정 가능합니다.\n선택된 입찰을 다시 누르면 선택을 취소할 수 있습니다.")
    }
    texting();
}

window.onload = function() {
    $(".wrap .container").css("min-height",$(window).height())
}