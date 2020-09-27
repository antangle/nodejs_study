const express = require('express');
const router = express.Router();

router.use(express.json({limit: '50mb'}));
router.use(express.urlencoded({limit:'50mb', extended: false }));

const define = require('../../definition/define');
const functions = require('../../controller/function');
const fcm_store = require('../../common/fcm_store');
const fcm_query = require('../../common/query_fcm');

//not done yet
router.post('/get1000NewReviews', async(req,res) =>{
    var result ={};
    try{
        var {} = req.body;
        result = await myPage.UserShutAccount410(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: get1000NewReviews/' + err);
        result.result = -10001;
        return res.json(result);
    }
});

module.exports = router;