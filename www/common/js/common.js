$(document).ready(function(){
	$("#header").load("/common/html/header.html");
	$("#footer").load("/common/html/footer.html");
});

function home(clicked) {
	if(!$(clicked).hasClass("select")){
		location.href="/web/home/";
	}
}

function myBid(clicked) {
	if(!$(clicked).hasClass("select")){
		location.href="/web/auction/";
	}
}

function alarmList(clicked) {
	if(!$(clicked).hasClass("select")){
		location.href="/web/alarm/";
	}
}

function myPage(clicked) {
	if(!$(clicked).hasClass("select")){
		location.href="/web/my/";
	}
}

function back() {
	window.history.back();
}