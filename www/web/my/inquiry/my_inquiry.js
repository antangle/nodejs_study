window.onload = function() {
    $(".wrap").css("min-height",$(window).height());
    $(".inquiry-type-select-wrap").css("height",$(document).height())
}

function selectType() {
    var selectWrap = ".wrap .inquiry-type-select-wrap"
    $(selectWrap).removeClass("hide")
}

function typeItem(clicked) {
    var selectWrap = ".wrap .inquiry-type-select-wrap"
    var inquiryTypeTxt = ".wrap .inquiry-type-wrap .inquiry-type-select .inquiry-type-select-txt"
    $(clicked).siblings(".select").removeClass("select")
    $(clicked).addClass("select")
    $(selectWrap).addClass("hide")
    $(inquiryTypeTxt).text($(clicked).children(".inquiry-type-select-item-name").text())
    if(!$(inquiryTypeTxt).hasClass("select")){
        $(inquiryTypeTxt).addClass("select")
        $(".wrap .inquiry-content-wrap").removeClass("hide")
        $(".wrap .inquire-btn-wrap").removeClass("hide")
    }
}

$(document).ready(function () {
	$('textarea').keyup(function () {
        $(".wrap .inquire-btn-wrap").addClass("active")
        if (!$.trim($("#inquiry-content").val())) {
            $(".wrap .inquire-btn-wrap").removeClass("active")
        }
	});
});