const express = require('express');
const router = express.Router();
const { hash } = require('bcrypt');
const jwt = require('jsonwebtoken');

const partner = require('../common/query_login');
const define = require('../../definition/define');
const {helper, comparePassword} = require('../../controller/validate');
const verify = require('../../middleware/verify');

router.use(express.urlencoded({limit:'50mb', extended: false }));
router.use(express.json({limit: '50mb'}));

router.get('/test1', verify.verifyToken, (req, res) =>{
    res.send('hi you are verified');
});

router.get('/test', async(req, res) =>{
    var result = {};
    var {partner_id} = req.query;
    try{
        result = await partner.test(partner_id);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: P904 - CheckId904/' + err);
        result.result = -9021;
        return res.json(result);
    }
});

//partner login/signup API
router.post('/Login901', async (req, res) =>{
    var result = {};
    var {login_id, device_token} = req.body;
    if (!login_id || !req.body.login_pwd) {
        return res.json({result: -9011});
    }
    if(!helper.isValidId(login_id)|| !helper.isValidPassword(req.body.login_pwd)){
        return res.json({result: -9011})
    }
    try{
        var dbResponse = await partner.getP001GetPassword(login_id);
        if(dbResponse.result !== 1){
            return res.json({result: -9012});
        }
        if(!dbResponse.data.hash_pwd){
            return res.json({result: 9013});
        }
        if(!helper.comparePassword(req.body.login_pwd, dbResponse.data.hash_pwd)){
            return res.json({result: 9014});
        }
        delete req.body.login_pwd;
        const token = helper.generateToken(dbResponse.data.partner_id);
        result = {
            token: token, 
            partner_id: dbResponse.data.partner_id,
            store_id: dbResponse.data.store_id,
            state: dbResponse.data.state
        }
        if(dbResponse.data.state === 1){
            await partner.updatePushTokenPartner(login_id, device_token)
            result.result = 9011;
        }
        else if(dbResponse.data.state === 2){
            await partner.updatePushTokenPartner(login_id, device_token)
            result.result = 9012;
        }
        else if(dbResponse.data.state === 3){
            await partner.updatePushTokenStore(login_id, device_token);
            result.result = 1;
        }
        else{
            result.result = -9012;
        }
        return res.json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: P901 - Login901/' + err);
        result.result = -9013;
        result.message = err;
        return res.json(result);
    }
});

router.post('/toJWT902', async(req, res) =>{
    var result = {};
    var {name, mobileno, birthdate} = req.body;
    if (!name|| !mobileno || !birthdate) {
        return res.json({result: 9021});
    }
    var json = {
        name: name, 
        mobileno: mobileno, 
        birthdate: birthdate
    };
    try{
        var encryptedData = helper.encryptJson(json);
        if(encryptedData === -9022){
            return res.json({result: encryptedData})
        }
        return res.json({result:1, encryptedData: encryptedData});
    }
    catch(err){
        console.log('router ERROR: P904 - CheckId904/' + err);
        result.result = -9021;
        return res.status(400).json(result);
    }
});

router.post('/CheckId904', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id) {
        return res.json({result: -9031});
    }
    else if(!helper.isValidId(login_id)){
        return res.json({result: -9031})
    }
    try{
        result = await partner.postP004LoginIdCheck(login_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: P904 - CheckId904/' + err);
        result.result = -9033;
        return res.status(400).json(result);
    }
});

router.post('/SignIn904', async (req, res) =>{
    var result = {};
    var {login_id, info} = req.body;
    if(!info){
        return res.json({result: 9041});
    }
    if(!helper.isValidId(login_id)|| !helper.isValidPassword(req.body.login_pwd)){
        return res.json({result: -9041});
    }
    try{
        const hash_pwd = helper.hashPassword(req.body.login_pwd);
        delete req.body.login_pwd;
        var store_info = jwt.decode(info);
        result = await partner.postP004IdPassword(login_id, hash_pwd, store_info);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        const token = helper.generateToken(result.partner_id);
        result.token = token
        return res.json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: P904 - SignIn904/' + err);
        result.result = -9044;
        return res.json(result);
    }
});

router.get('/GetSdCode907', async (req, res) =>{
    var result ={};
    try{
        result = await partner.get007SdCode();
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 007 - GetSidoCode/' + err);
        result.result = -90701;
        return res.json(result);
    }
});

router.get('/GetSggCode907', async (req, res) =>{
    var result ={};
    var {sido_code} = req.query;
    if(sido_code <100){
        return res.json({result: -90711});
    }
    try{
        result = await partner.get007SggCode(sido_code);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 007 - GetSggCode/' + err);
        result.result = -90713;
        return res.json(result);
    }
});

router.post('/postLocationCode907', async (req, res) =>{
    var result ={};
    var {partner_id, sido_code, sgg_code} = req.body;
    if(!sido_code || !sgg_code || !partner_id || sido_code <100|| sgg_code < 100){
        return res.json({result: -90721});
    }
    try{
        result = await partner.postP007LocationCode(sido_code, sgg_code, partner_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: P907 - postLocationCode907/' + err);
        result.result = -90722;
        return res.json(result);
    }
});

router.post('/makeMeStore908', async(req, res) =>{
    var result = {}
    var store_info = req.body;
    /*  store info ={
            partner_id, 
            uuid, name,
            trade_name, phone,
            phone_1, address
        }
    */
    if(!store_info.partner_id || !store_info.uuid || !store_info.name || !store_info.phone){
        return res.json({result: -9083})
    }
    try{
        result = await partner.makeMeStore908(store_info);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: p908 - makeMeStore908/' + err);
        result.result = -9081;
        return res.json(result);
    }
});

router.post('/partnerToStore909', async(req, res) =>{
    var result ={};
    var {partner_id} = req.body;
    if(!partner_id){
        return res.json({result: -9093})
    }
    try{
        result = await partner.PartnerToStore909(partner_id);
        if(result.result != define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: p909 - partnerToStore909/' + err);
        result.result = -9091;
        return res.json(result);
    }
});

router.post('/postUpdateToken909', async (req, res) =>{
    var result ={};
    var {partner_id, token} = req.body;
    try{
        result = await partner.PartnerUpdateToken909(partner_id, token);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: P009 - postUpdateToken909/' + err);
        result.result = -928;
        return res.status(400).json(result);
    }
});

router.post('/postLogout910', async (req, res) =>{
    var result ={};
    var {partner_id, token} = req.body;
    try{
        result = await partner.PartnerLogout910(partner_id);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: P910 - postLogout910/' + err);
        result.result = -929;
        return res.status(400).json(result);
    }
});

router.post('/postShutAccount911', async (req, res) =>{
    var result ={};
    var {partner_id, token} = req.body;
    try{
        result = await partner.PartnerShutAccount911(partner_id);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: P911 - postShutAccount911/' + err);
        result.result = -930;
        return res.status(400).json(result);
    }
});

module.exports = router;