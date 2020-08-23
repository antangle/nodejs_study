function decodejwt(jwtData){
    try{
        var decoded = jwt.decode(jwtData);
        return decoded.payload;
    }
    catch{
        return -9043;
    }
}

function check_DiscountPrice(discount_price){
    if(isNaN(discount_price)){
        return -1;
    }
    //자릿수 10000원대만 나오게 sanitize
    discount_price = parseInt(discount_price/10000)*10000;
    return discount_price;
}

function check_IsNumber(number){
    if(isNaN(number)){
        return -1;
    }
    return number;
}

function check_State(state){
    if(isNaN(state)){
        return -1;
    }
    else if(state !== 1){
        return -1;
    }
    else{
        return 1;
    }
}

function check_OneTwo(number){
    if(isNaN(number)){
        return -1;
    }
    if(number !== 1 && number !== 2){
        return -1;
    }
    return number;
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

function generate_condition(agency, change_type, plan, delivery){
    return (agency-1)*8 + (change_type-1)*4 + (plan-1)*2 + (delivery-1);
}

function generate_dvi(device_id, volume){
    return device_id.toString() + '_' + volume.toString();
}



module.exports ={
    decodejwt,
    check_DiscountPrice,
    check_IsNumber,
    check_OneTwo,
    check_State,
    check_plan,
    check_type,
    generate_condition,
    generate_dvi,
}