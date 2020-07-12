var express = require('express');
var router = express.Router();
const phoneDB = require('../query/phone');
const userBidDB = require('../query/userBid');
const createDB = require('../query/createOrDrop')


//data: {nickname}
router.post('/start', userBidDB.startBidding);

//자신이 고른 핸드폰 name, company, img(notyet!) 반환
router.get('/getSelectedPhone', phoneDB.getSelectedPhone);
//data없이 그냥 썡으로 요청, phones DB내용 반환
router.get('/getPhonesFromDB', phoneDB.getPhonesFromDB);
//data= {phone_brand } 요청
router.get('/getPhonesByCompany', phoneDB.getPhonesByBrand);
//data= {nickname, phone_name, phone_brand}
router.post('/buyNextStep1', userBidDB.buyNextStep1);
//data= {phone_name}
router.get('/getColorCapacityByPhone', phoneDB.getColorCapacityByPhone);
//data= {nickname, phone_color, phone_capacity}
router.post('/buyNextStep2', userBidDB.buyNextStep2);


/*{   
    "nickname" :  "antangle", 
    "current_carrier": "SKT", 
    "want_carrier": "SKT",
    "want_plan":  90000, 
    "want_payment_period": 24,
    "contract": "selection", 
    "want_contract_period": 0,
    "return_phone": 0, 
    "six_month_payment_plan": 0,
    "affiliate_card": 0
}*/
router.post('buyNextStep3', userBidDB.buyNextStep3);
router.post('buyNextStep4', userBidDB.buyNextStep4);

module.exports = router;
