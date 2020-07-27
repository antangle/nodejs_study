const express = require('express');
const router = express.Router();
const buy = require('../db_layer/query_buy');
const define = require('../../definition/define')
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: false }));

router.get('/getHomepageDevice', async (req, res) =>{
    var result ={};
    try{
        result = await buy.get100LatestDeviceHomepage(); 
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
    }
    catch(err){
        console.log('router ERROR: 100/' + err);
        result.result = -100;
    }
    finally{
        return res.json(result);
    }
});

router.get('/countAuction', async (req, res) =>{
    var result ={};
    try{
        var {user_id} = req.query;
        result = await buy.countAuctions(user_id); 
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
    }
    catch(err){
        console.log('router ERROR: 100/' + err);
        result.result = -100;
    }
    finally{
        return res.json(result);
    }
});

router.get('/getStep1Latest', async(req,res) =>{
    var result ={};
    try{
        var {user_id, device_id} = req.query;
        result = await buy.getAuctionTempWithUser(user_id, device_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        var latestDevices = await buy.getStep1Latest6();
        if(latestDevices.result != define.const_SUCCESS)
            throw latestDevices.result;
        result.device_array = latestDevices.device_array;
    }
    catch(err){
        console.log('router ERROR: 101/' + err);
        result.result = -101;
    }
    finally{
        return res.json(result);
    }
});

router.get('/getStep1WithBrand', async(req, res) => {
    var result ={};
    try{
        var {user_id, device_id, brand_id} = req.query;
        result = await buy.getAuctionTempWithUser(user_id, device_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        result = await buy.getStep1DeviceByBrand(brand_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
    }
    catch(err){
        console.log('router ERROR: 102/' + err);
        result.result = -102;
    }
    finally{
        return res.json(result);
    }
});

router.post('/postSaveStep1', async(req, res) =>{
    var result ={};
    try{
        var {user_id, device_id} = req.body;
        var {state, temp_device_id} = await buy.checkIsFirstAuction(user_id);
        if(state === define.const_DEAD || temp_device_id !== define.const_NULL){
            const postInfo = await buy.postStep1Update(user_id, device_id);
            if(postInfo.result != define.const_SUCCESS)
                throw(postInfo.result);
            result.result = define.const_SUCCESS;
        }
        if (temp_device_id === define.const_NULL){
            const postInfo = await buy.postStep1Insert(user_id, device_id);
            if(postInfo.result != define.const_SUCCESS)
                throw(postInfo.result);
            result.result = define.const_SUCCESS;
        }
    }
    catch(err){
        console.log('router ERROR: 103/' + err);
        result.result = -103;
    }
    finally{
        return res.json(result);
    }
});
//step:2
router.get('/getStep2ColorVolume', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.query;
        result = await buy.getAuctionTempWithUser(user_id);
        if(result.state === define.const_DEAD || result.temp_device_id === define.const_NULL){
            result.result = -1111;
            console.log('this user\'s state or device_id is either NULL or DEAD');
            throw(result.result)
        }
        var device_id = result.temp_device_id;
        var data = await buy.getStep2ColorVolume(device_id);
        result.rowCount = data.rowCount;
        result.data = data.data;
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
    }
    catch(err){
        console.log('router ERROR: 111/' + err);
        result.result = -111;
    }
    finally{
        return res.json(result);
    }
});
router.post('/postSaveStep2', async (req, res) =>{
    var result ={};
    try{
        var {user_id, device_detail_id} = req.body;
        //check if auction_temp has that user_id
        var check = await buy.getAuctionTempWithUser(user_id);
        result = await buy.postStep2Update(user_id, device_detail_id, check);
        if(result.result !== define.const_SUCCESS)
            throw(isError.result);
    }
    catch(err){
        console.log('router ERROR: 112/' + err);
        result.result = -112;
    }
    finally{
        return res.json(result);
    }
});
//step:3
router.get('/getStep3Info', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.query;
        result = await buy.getAuctionTempWithUserStep3(user_id);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
    }
    catch(err){
        console.log('router ERROR: 121/' + err);
        result.result = -121;
    }
    finally{
        return res.json(result);
    }
});
router.get('/getStep3PaymentInfo', async(req,res) =>{
    var result ={};
    try{
        var {agency, generation} = req.query;
        result = await buy.getStep3PaymentInfo(agency, generation);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
    }
    catch(err){
        console.log('router ERROR: 122/' + err);
        result.result = -122;
    }
    finally{
        return res.json(result);
    }
});

router.get('/getStep3OfficialInfo', async(req,res) =>{
    var result ={};
    try{
        var {device_id, payment_id, volume} = req.query;
        result = await buy.getSelectedPayment(device_id, payment_id, volume);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
    }
    catch(err){
        console.log('router ERROR: 122/' + err);
        result.result = -122;
    }
    finally{
        return res.json(result);
    }
});

router.post('/postSaveStep3', async (req, res) =>{
    var result ={};
    try{
        var postInput = req.body;
        var check = await buy.getAuctionTempWithUserStep3(postInput.user_id);
        if(check.result != define.const_SUCCESS)
            throw(check.result);
        count = await buy.countAuctions(postInput.user_id);
        if(count.result != define.const_SUCCESS)
            throw(count.result);
        if(count.count >= 3){
            result.result = -1233
            throw(result.result)
        }
        //check returning device_id, state, device_detail_id
        //postInput has all the info of step 3
        result = await buy.postStep3Update(check, postInput);
        result.count = Number(count.count) + 1;
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        var kill = await buy.killAuctionTempState(postInput.user_id);
        if(kill.result != define.const_SUCCESS)
            throw(kill.result);
    }
    catch(err){
        console.log('router ERROR: 123/' + err);
        result.result = -123;
    }
    finally{
        return res.json(result);
    }
});

router.get('/finish', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.query;
        result = await buy.finishAuctionTempDeviceInfo(user_id);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
    }
    catch(err){
        console.log('router ERROR: 131/' + err);
        result.result = -131;
    }
    finally{
        return res.json(result);
    }
});
module.exports = router;