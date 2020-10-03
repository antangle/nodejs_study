const express = require('express');
const router = express.Router();
const { hash } = require('bcrypt');
const jwt = require('jsonwebtoken');

const path = require('path')
const version = require('../common/version').version;

const {helper} = require('../../controller/validate');
const functions = require('../../controller/function');
const define = require('../../definition/define');
const verify = require('../../middleware/verify');

const partner = require(path.join('../..', 'common' + version, 'query_login'));

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
    var {login_id, push_token} = req.body;
    if(!push_token){
        push_token = null;
    }
    if (!login_id || !req.body.login_pwd) {
        return res.json({result: -9011});
    }
    try{
        var dbResponse = await partner.getP001GetPassword(login_id);
        if(dbResponse.result !== 1){
            return res.json({result: dbResponse.result});
        }
        //회원탈퇴 된상태
        if(dbResponse.data.state === -1){
            return res.json({result: 9015});
        }
        //아이디 틀림
        if(!dbResponse.data.hash_pwd){
            return res.json({result: 9013});
        }
        //비번 틀림
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
            var push = await partner.updatePushTokenPartner(login_id, push_token)
            if(push.result !== define.const_SUCCESS){
                return res.json(push);
            }
            result.result = 1;
        }
        else if(dbResponse.data.state === 2){
            var push = await partner.updatePushTokenPartner(login_id, push_token)
            if(push.result !== define.const_SUCCESS){
                return res.json(push);
            }
            result.result = 1;
        }
        else if(dbResponse.data.state === 3){
            var push = await partner.updatePushTokenPartner(login_id, push_token);
            if(push.result !== define.const_SUCCESS){
                return res.json(push);
            }
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
        return res.json(result);
    }
});

router.post('/toJWT902', async(req, res) =>{
    var result = {};
    var {name, mobileno, birthdate, dupinfo} = req.body;
    if (!name|| !mobileno || !birthdate || !dupinfo) {
        return res.json({result: 9021});
    }
    var json = {
        name: name, 
        mobileno: mobileno, 
        birthdate: birthdate,
        dupinfo: dupinfo
    };
    try{
        var encryptedData = helper.encryptJson(json);
        if(encryptedData === -9022){
            return res.json({result: encryptedData})
        }
        return res.json({result:1, encryptedData: encryptedData});
    }
    catch(err){
        console.log('router ERROR: P902 - toJWT902/' + err);
        result.result = -9021;
        return res.json(result);
    }
});

router.post('/checkDupinfo', async(req, res) =>{
    var result = {};
    var {info} = req.body;
    if (!info) {
        return res.json({result: -90234});
    }
    var {dupinfo} = jwt.decode(info);      
    try{
        result = await partner.checkDupinfoPartner(dupinfo);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: P902 - toJWT902/' + err);
        result.result = -90231;
        return res.json(result);
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
        return res.json(result);
    }
});

router.post('/SignIn904', async (req, res) =>{
    var result = {};
    var {login_id, info, push_token} = req.body;
    if(!push_token){
        push_token = null;
    }
    if(!info){
        return res.json({result: 9041});
    }
    if(!login_id || !req.body.login_pwd) {
        return res.json({result: 9041});
    }
    if(!helper.isValidId(login_id)|| !helper.isValidPassword(req.body.login_pwd) ||
        functions.check_StringLength(req.body.login_pwd, 6, 20) === -1){
        return res.json({result: -9041});
    }
    try{
        //hash password
        const hash_pwd = helper.hashPassword(req.body.login_pwd);
        delete req.body.login_pwd;
        //jwt decode
        var store_info = jwt.decode(info);

        var check = await partner.checkDupinfoPartner(store_info.dupinfo);
        if(check.result !== define.const_SUCCESS){
            return res.json({result: 9042});
        }

        result = await partner.postP004IdPassword(login_id, hash_pwd, store_info);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }

        var push = await partner.updatePushTokenPartner(login_id, push_token);
        if(push.result !== define.const_SUCCESS){
            return res.json({result: -9047})
        }
        const token = helper.generateToken(result.partner_id);
        result.token = token
        return res.json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: P904 - SignIn904/' + err);
        result.result = -9043;
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
        return res.json({result: 90711});
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
        return res.json({result: 90721});
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
        return res.json({result: 9081})
    }
    try{
        result = await partner.StoreTempInsert908(store_info);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await partner.updatePartnerMakeMeStore(store_info.partner_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result.partner_id = store_info.partner_id;
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: p908 - makeMeStore908/' + err);
        result.result = -90811;
        return res.json(result);
    }
});

router.post('/partnerToStore909', async(req, res) =>{
    var result ={};
    var {partner_id} = req.body;
    if(!partner_id){
        return res.json({result: 9091})
    }
    try{
        let store_id;
        result = await partner.storeAcceptCheckUUID(partner_id);
        if(result.result === 1){
            //uuid 중복 없을시
            store = await partner.storeAcceptInsertStore(partner_id);
            if(store.result !== define.const_SUCCESS){
                return res.json(store);
            }
            store_id = store.store_id;
        }
        else if(result.result === 2){
            //uuid 중복 있을시
            store_id = result.store_id
        }
        else{
            return res.json(result);
        }
        result = await partner.storeAcceptUpdateStoreTemp(partner_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await partner.storeAcceptUpdatePartner(store_id, partner_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: p909Accept - partnerToStore909/' + err);
        result.result = -90901;
        return res.json(result);
    }
});

router.post('/partnerToStoreDeny909', async(req, res) =>{
    var result ={};
    var {partner_id} = req.body;
    if(!partner_id){
        return res.json({result: 90921})
    }
    try{
        result = await partner.storeDenyUpdateStoreTemp(partner_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: p909Deny - partnerToStoreDeny909/' + err);
        result.result = -90921;
        return res.json(result);
    }
});

router.post('/partnerToStoreInfo', async(req, res) =>{
    var result ={};
    var {pwd} = req.body;
    try{
        if(!pwd){
            return res.json({result: 90931})
        }
        if(pwd != process.env.CUTDELETEPWD){
            return res.json({result: 90932})
        }    
        result = await partner.partnerToStoreInfo();
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: p909- partnerToStoreInfo/' + err);
        result.result = -90931;
        return res.json(result);
    }
});

router.post('/checkState910', async(req, res) =>{
    var result ={};
    var {partner_id} = req.body;
    try{
        if(!partner_id){
            return {result: 9101};
        }
        result = await partner.checkState910(partner_id);
        if(result.result != define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: P910 - checkState910/' + err);
        result.result = -9101;
        return res.json(result);
    }
})






//#region 여기서부터 안쓰는 코드

router.post('/postUpdateToken910', async (req, res) =>{
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
        return res.json(result);
    }
});

router.post('/postLogout911', async (req, res) =>{
    var result ={};
    var {partner_id, token} = req.body;
    try{
        result = await partner.PartnerLogout910(partner_id);
        if(result.result != define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: P910 - postLogout910/' + err);
        result.result = -929;
        return res.json(result);
    }
});

router.post('/postShutAccount911', async (req, res) =>{
    var result ={};
    var {partner_id, token} = req.body;
    try{
        result = await partner.PartnerShutAccount911(partner_id);
        if(result.result != define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: P911 - postShutAccount911/' + err);
        result.result = -930;
        return res.json(result);
    }
});

//#endregion

module.exports = router;