var express = require('express');
var router = express.Router();
const buy = require('./buy/step1');

//a constant which mean NULL in int
const const_null = -2;
//a constant which mean 'const_success' in int
const const_success = 1

router.get('/test', async(req,res) =>{
    var result ={};
    try{
        var {user_id, device_id} = req.query;
        result = await buy.getAuctionTempWithUser(user_id); 
        if(result.result != const_success)
            throw(result.result);
    }
    catch(err){
        console.log('router test ERROR: ' + err);
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
        if(result.result != const_success)
            throw(result.result);
        var latestDevices = await buy.getStep1Latest6();
        if(latestDevices.result != const_success)
            throw latestDevices.result;
        result.device_array = latestDevices.device_array;
        result.result = const_success;
    }
    catch(err){
        console.log('router ERROR: 101' + err);
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
        if(result.result != const_success)
            throw(result.result);
        result = await buy.getStep1DeviceByBrand(brand_id);
        if(result.result != const_success)
            throw(result.result);
        result.result = const_success;
    }
    catch(err){
        console.log('router ERROR: 102' + err);
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
        if (temp_device_id == const_null){
            const isError = await buy.postStep1Insert(user_id, device_id);
            if(isError.result != const_success)
                throw(isError.result);
            result.result = const_success;
        }
        else{
            const isError = await buy.postStep1Update(user_id, device_id);
            if(isError.result != const_success)
                throw(isError.result);
            result.result = 1;
        }
    }
    catch(err){
        console.log('router ERROR: 103' + err);
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
        if(result.state == -1)
            throw(-1001)
        var device_id = result.temp_device_id;
        result.data = await buy.getStep2ColorVolume(device_id);
        if(result.result != const_success)
            throw(result.result);
        result.result = const_success;
    }
    catch(err){
        console.log('router 111 ERROR: ' + err);
    }
    finally{
        return res.json(result);
    }
});


module.exports = router;
