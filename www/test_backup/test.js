var test4count = 0;
var test5count = 0;

function test2(){
    alert("test2!!");
}

function test4(){
    var output4 = document.getElementById("output4");

    output4.innerHTML = "print 4!!" + test4count;
    test4count++;
}

function test5(){
    var output5 = document.getElementById("output5");

    output5.innerHTML = "print 5!!" + test5count;
    test5count++;
}


function check3(){
    var value = document.getElementById("value").value;

    if (value == "3") {
        alert("test3!!");

    } else {
        alert("err::"+value);
        return false;
    }
}