var express = require('express');
var router = express.Router();
const phoneDB = require('../query/phone');
const userBidDB = require('../query/userBid');

//data: {nickname}
router.post('/start', userBidDB.startBidding);
//data없이 그냥 썡으로 요청, phones DB내용 반환
router.get('/web/buy/1', phoneDB.getPhonesFromDB);
//data없이 그냥 썡으로 요청, 자신이 고른 핸드폰 name, company, img(notyet!) 반환
router.get('/getphone', phoneDB.getSelectedPhone);
//brand의 name에따라 phone_name을 반환, 서버 요청시 {data: phone_company} 요청
router.get('/web/buy/1/brand', phoneDB.getPhonesByCompany);
//data= {nickname, user_id, phone_name, phone_company}
router.post('/web/buy/1', userBidDB.buyNextStep1);
//data= {phone_color, phone_capacity}
router.get('/web/buy/2', phoneDB.getColorCapacityByPhone);
//data= {nickname, phone_color, phone_capacity}
router.post('/web/buy/2', userBidDB.buyNextStep2);
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
router.post('/web/buy/3', userBidDB.buyNextStep3);
router.post('/web/buy/4', )

module.exports = router;