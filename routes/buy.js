var express = require('express');
var router = express.Router();
const buy = require('./buy/step');

//a constant which mean NULL in int
const const_NULL = -2;
//a constant which mean 'const_SUCCESS' in int
const const_SUCCESS = 1
//state is dead
const const_DEAD = -1
router.get('/test', async(req,res) =>{
    var result ={};
    try{
        var {user_id, device_id} = req.query;
        result = await buy.getAuctionTempWithUser(user_id); 
        if(result.result != const_SUCCESS)
            throw(result.result);
    }
    catch(err){
        console.log('router test ERROR: ' + err);
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
        if(result.result != const_SUCCESS)
            throw(result.result);
        result.result = const_SUCCESS;
    }
    catch(err){
        console.log('router ERROR: 100/' + err);
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
        if(result.result != const_SUCCESS)
            throw(result.result);
        var latestDevices = await buy.getStep1Latest6();
        if(latestDevices.result != const_SUCCESS)
            throw latestDevices.result;
        result.device_array = latestDevices.device_array;
        result.result = const_SUCCESS;
    }
    catch(err){
        console.log('router ERROR: 101/' + err);
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
        if(result.result != const_SUCCESS)
            throw(result.result);
        result = await buy.getStep1DeviceByBrand(brand_id);
        if(result.result != const_SUCCESS)
            throw(result.result);
        result.result = const_SUCCESS;
    }
    catch(err){
        console.log('router ERROR: 102/' + err);
    }
    finally{
        return res.json(result);
    }
});

router.post('/postSaveStep1', async(req, res) =>{
    var result ={};
    try{
        var {user_id, device_id} = req.body;
        var {temp_device_id} = await buy.getAuctionTempWithUser(user_id); 

        console.log(user_id,device_id, temp_device_id)
        if (temp_device_id == const_NULL){
            const isError = await buy.postStep1Insert(user_id, device_id);
            if(isError.result != const_SUCCESS)
                throw(isError.result);
            result.result = const_SUCCESS;
        }
        else{
            const isError = await buy.postStep1Update(user_id, device_id);
            if(isError.result != const_SUCCESS)
                throw(isError.result);
            result.result = 1;
        }
    }
    catch(err){
        console.log('router ERROR: 103/' + err);
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
        if(result.state == const_DEAD || result.state == const_NULL || temp_device_id == const_NULL){
            result.result = -1111;
            console.log('this user\'s state or device_id is either NULL or DEAD');
            throw(result.result)
        }
            var device_id = result.temp_device_id;
        result.data = await buy.getStep2ColorVolume(device_id);
        if(result.result != const_SUCCESS)
            throw(result.result);
        result.result = const_SUCCESS;
    }
    catch(err){
        console.log('router ERROR: 111/' + err);
    }
    finally{
        return res.json(result);
    }
});
router.post('/postSaveStep2', async (req, res) =>{
    var result ={};
    try{
        var {user_id, device_detail_id} = req.body;
        var check = await buy.getAuctionTempWithUser(user_id);
        result = await buy.postStep2Update(user_id, device_detail_id, check);
        if(result.result != const_SUCCESS)
            throw(isError.result);
        result.result = 1;
    }
    catch(err){
        console.log('router ERROR: 112/' + err);
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
        if(result.result != const_SUCCESS){
            throw(result.result);
        }
        result.result = const_SUCCESS;
    }
    catch(err){
        console.log('router ERROR: 121/' + err);
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
        if(check.result != const_SUCCESS)
            throw(check.result);
        count = await buy.countAuctions(postInput.user_id);
        if(count.result != const_SUCCESS)
            throw(count.result);
        else if(count.count >= 3){
            result.result = -1223
            throw(result.result)
        }
        result = await buy.postStep3Update(check, postInput);
        result.count = Number(count.count) + 1;
        if(result.result != const_SUCCESS)
            throw(result.result);
        var kill = await buy.killAuctionTempState(postInput.user_id);
        if(kill.result != const_SUCCESS)
            throw(kill.result);
        result.result = 1;
    }
    catch(err){
        console.log('router ERROR: 122/' + err);
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
        if(result.result != const_SUCCESS){
            throw(result.result);
        }
        result.result = const_SUCCESS;
    }
    catch(err){
        console.log('router ERROR: 131/' + err);
    }
    finally{
        return res.json(result);
    }
});
module.exports = router;
