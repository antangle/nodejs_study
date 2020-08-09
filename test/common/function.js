function decodejwt(jwtData){
    try{
        var decoded = jwt.decode(jwtData);
        return decoded.payload;
    }
    catch{
        return -9043;
    }
}
module.exports ={
    decodejwt,
}