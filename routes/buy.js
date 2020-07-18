var express = require('express');
var router = express.Router();
const buy = require('./buy/step1');

router.get('/test', async(req,res) =>{
    var result ={};
    try{
        const data = await buy.Step1GetDeviceByBrand(1);
        console.log(data);
        result = data
    }
    catch(err){
        console.log('router getStep1Latest ERROR: ' + err);
        result.result = 'fail';
    }
    finally{
        return res.json(result);
    }
});

router.get('/getStep1Latest', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.query;
        result = await buy.getAuctionTempWithUser(user_id);
        var latestDevices = await buy.getStep1Latest6();
        result.device_array = latestDevices.device_array;
        result.result = 1;
    }
    catch(err){
        console.log('router getStep1Latest ERROR: ' + err);
        result.result = -101;
    }
    finally{
        return res.json(result);
    }
});

router.get('/getStep1WithBrand', async(req, res) => {
    var result ={};
    try{
        var {user_id, brand_id} = req.query;
        result = await buy.getAuctionTempWithUser(user_id);
        result = await buy.Step1GetDeviceByBrand(brand_id);
        result.result = 1;
    }
    catch(err){
        console.log('router getStep1WithBrand ERROR: ' + err);
        result.result = -102;
    }
    finally{
        return res.json(result);
    }
});

/*
//101. step:1
router.get('/getStep1Latest', async (req, res)=>{
    var result ={};
    try{
        var {user_id} = req.query;
        const stateDeviceId = await buy.getAuctionTempWithUser(user_id);
        if(device_id == const_null){
            result.status = 'fail'
        }
        else{
            result = await buy.getSixDevice(device_id);
            result.status = 'success';
        }
    }
    catch(err){
        console.log('router getDeviceFromDB ERROR: ' + err);
        result.status = 'fail';
    }
    finally{
        return res.json(result);
    }
});

router.get('/getDeviceWithBrand', async (req, res)=>{
    var result={};
    try{
        var {user_id, brand_id} = req.query;
        const state = await buy.getStateFromTempAuction(user_id);
        if(state == -1){
            throw new error('state is -1')
        }
        result = await buy.getDeviceByBrand(brand_id);
        result.status = 'success';
    }
    catch{
        console.log('router getDeviceWithBrand ERROR: ' + err);
        result.status = 'fail';
    }
    finally{
        return res.json(result);
    }
});

router.post('/postBuyStep1', async (req,res) =>{
    var result = {};
    try{
        var {user_id, device_name} = req.body;
        result = await buy.postBuyStep1(user_id, device_name);
        result.status = 'success';
        console.log(result);
    }
    catch{
        console.log('router postBuyStep1 ERROR: ' + err);
        result.status = 'fail';
    }
    finally{
        return res.json(result);
    }
});

//step: 2




//buy step:0
router.post('/start', post.startBidding);

//buy step:1
router.get('/getPhonesFromDB', get.getPhonesFromDB);
router.get('/getPhonesByBrand', get.getPhonesByBrand);
router.post('/buyNextStep1', post.buyNextStep1);

//buy step:2
router.get('/getColorVolumeByPhone', get.getColorVolumeByPhone);
router.post('/buyNextStep2', post.buyNextStep2);

//buy step:3
router.post('/buyNextStep3', post.buyNextStep3);

//buy step:4
router.post('/buyNextStep4', post.buyNextStep4);
*/
module.exports = router;
