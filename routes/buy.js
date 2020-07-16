var express = require('express');
var router = express.Router();
const phoneDB = require('./buy/get');
const userBidDB = require('./buy/post');

router.post('/start', userBidDB.startBidding);

//router.get('/getSelectedPhone', phoneDB.getSelectedPhone);

//buy step:1
router.get('/getPhonesFromDB', phoneDB.getPhonesFromDB);
router.get('/getPhonesByBrand', phoneDB.getPhonesByBrand);
router.post('/buyNextStep1', userBidDB.buyNextStep1);

//buy step:2
router.get('/getColorVolumeByPhone', phoneDB.getColorVolumeByPhone);
router.post('/buyNextStep2', userBidDB.buyNextStep2);

//buy step:3
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
router.post('/buyNextStep3', userBidDB.buyNextStep3);

//buy step:4
router.post('/buyNextStep4', userBidDB.buyNextStep4);

module.exports = router;
