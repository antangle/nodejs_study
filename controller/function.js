const { now } = require("moment");

function decodejwt(jwtData){
    try{
        var decoded = jwt.decode(jwtData);
        return decoded.payload;
    }
    catch{
        return -9043;
    }
}

function check_StringLength(string, min, max){
    if(string.length < min){
        return -1;
    }
    else if(string.length > max){
        return -1;
    }
    else{
        return 1;
    }
}
function check_DiscountPrice(discount_price){
    discount_price = parseInt(discount_price, 10);
    if(isNaN(discount_price) || discount_price < 50000){
        return -1;
    }
    //자릿수 10000원대만 나오게 sanitize
    discount_price = parseInt(discount_price/10000)*10000;
    return discount_price;
}

function check_IsNumber(number){
    number = parseInt(number, 10);
    if(isNaN(number)){
        return -1;
    }
    return number;
}

function check_State(state){
    if(state == 1){
        return 1;
    }
    else if(state == -1){
        return -1;
    }
    else{
        return -2;
    }
}

function check_Cancel(cancel){
    if(cancel == 1){
        return 1;
    }
    else if(cancel == -1){
        return -1;
    }
    else{
        return -1;
    }
}

function check_OneTwo(number){
    if(number == 1 || number == 2){
        return Number(number);
    }
    else{
        return -1;
    }
}

function check_OneTwoThree(number){
    if(number == 1 || number == 2 || number == 3){
        return Number(number);
    }
    else{
        return -1
    }
}

function check_plan(plan){
    if(isNaN(plan)){
        return -1;
    }
    else if(plan == 1){
        return 1;
    }
    else if (plan != 1){
        return 2;
    }
    return plan;
}

function check_type(now, hope){
    if(now != hope){
        return 1;
    }
    else{
        return 2;
    }
}

function generate_condition(agency, change_type){
    return (agency-1)*2 + change_type-1;
}

function generate_dvi(device_id, volume){
    return device_id.toString() + '_' + volume.toString();
}

function set_point(discount_price, now_discount_price){
    if(discount_price > now_discount_price){
        return 50;
    }
    else{
        return 50;
    }
}

function set_point_by_id(store_id, current_store_id){
    if(store_id == current_store_id){
        return 0;
    }
    else{
        return 0;
    }
}

function check_StringID(string_id){
    string_id = parseInt(string_id, 10);
    if(isNaN(string_id)){
        return -1;
    }
    return string_id.toString();
}

module.exports ={
    decodejwt,
    check_DiscountPrice,
    check_IsNumber,
    check_OneTwo,
    check_OneTwoThree,
    check_State,
    check_Cancel,
    check_plan,
    check_type,
    check_StringLength,
    check_StringID,
    generate_condition,
    generate_dvi,
    set_point,
    set_point_by_id
}