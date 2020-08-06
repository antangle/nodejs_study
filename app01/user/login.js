const express = require('express');
const router = express.Router();
const { hash } = require('bcrypt');
const jwt = require('jsonwebtoken');

const user = require('../common/query_login');
const define = require('../../definition/define');
const {helper} = require('../../controller/validate');
const {verifyToken} = require('../../middleware/verify');

router.use(express.urlencoded({limit:'50mb', extended: false }));
router.use(express.json({limit: '50mb'}));

router.get('/test', verifyToken, (req, res) =>{
    res.send('hi you are verified');
});

//#region user login/signup API
router.post('/Login901', async (req, res) =>{
    var result = {};
    var {login_id, push_token} = req.body;
    if (!login_id || !req.body.login_pwd) {
        return res.json({result: -9211});
    }
    try{
        var dbResponse = await user.getU001GetPassword(login_id);
        if(dbResponse.result !== 1){
            return res.json({result: dbResponse.result});
        }
        //회원탈퇴
        if(dbResponse.data.state === -1){
            return res.json({result: 9215});
        }
        //아이디 틀림
        if(!dbResponse.data.hash_pwd){
            return res.json({result: 9213});
        }
        //비번 틀림
        if(!helper.comparePassword(req.body.login_pwd, dbResponse.data.hash_pwd)){
            return res.json({result: 9214});
        }
        delete req.body.login_pwd;
        const token = helper.generateToken(dbResponse.data.user_id);
        result = {
            token: token, 
            user_id: dbResponse.data.user_id,
            state: dbResponse.data.state,
            result: define.const_SUCCESS
        }
        return res.json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: U901 - Login901/' + err);
        result.result = -9213;
        result.message = err;
        return res.json(result);
    }
});

router.post('/toJWT902', async(req, res) =>{
    var result = {};
    var {name, mobileno, birthdate, dupinfo} = req.body;
    if (!name|| !mobileno || !birthdate || !dupinfo) {
        return res.json({result: 9221});
    }
    var json = {
        name: name, 
        mobileno: mobileno, 
        birthdate: birthdate,
        dupinfo: dupinfo
    };
    try{
        var encryptedData = helper.encryptJson(json);
        if(encryptedData === -9222){
            return res.json({result: encryptedData})
        }
        return res.json({result:1, encryptedData: encryptedData});
    }
    catch(err){
        console.log('router ERROR: U902 - toJWT902/' + err);
        result.result = -9221;
        return res.status(400).json(result);
    }
});

router.post('/checkDupinfo', async(req, res) =>{
    var result = {};
    var {info} = req.body;
    if (!info) {
        return res.json({result: -92234});
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
        console.log('router ERROR: U902 - toJWT902/' + err);
        result.result = -92231;
        return res.status(400).json(result);
    }
});

router.post('/CheckId904', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id) {
        return res.json({result: -9231});
    }
    else if(!helper.isValidId(login_id)){
        return res.json({result: -9231})
    }
    try{
        result = await partner.postP004LoginIdCheck(login_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: U904 - CheckId904/' + err);
        result.result = -9233;
        return res.status(400).json(result);
    }
});

router.post('/SignIn904', async (req, res) =>{
    var result = {};
    var {login_id, info} = req.body;
    if(!info){
        return res.json({result: 9241});
    }
    if(!login_id || !req.body.login_pwd) {
        return res.json({result: 9241});
    }
    if(!helper.isValidId(login_id)|| !helper.isValidPassword(req.body.login_pwd)){
        return res.json({result: -9241});
    }
    try{
        //hash password
        const hash_pwd = helper.hashPassword(req.body.login_pwd);
        delete req.body.login_pwd;
        //jwt decode
        var store_info = jwt.decode(info);

        var check = await partner.checkDupinfoPartner(store_info.dupinfo);
        if(check.result !== define.const_SUCCESS){
            return res.json({result: 9242});
        }

        result = await partner.postP004IdPassword(login_id, hash_pwd, store_info);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        const token = helper.generateToken(result.partner_id);
        console.log(result);
        result.token = token
        return res.json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: U904 - SignIn904/' + err);
        result.result = -9244;
        return res.json(result);
    }
});

router.post('/CheckNick906', async (req, res) =>{
    var result = {};
    var {nick, user_id} = req.body;
    if(!nick || !user_id){
        return res.json({result: 92612});
    }
    else if(!helper.isValidNickname(nick)){
        return res.json({result: -92615});
    }
    try{
        result = await user.post006NicknameCheck(nick, user_id);
        if(result.result != define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }   
    catch(err){
        console.log('router ERROR: U906 - CheckNick906/' + err);
        result.result = -92611;
        return res.json(result);
    }
});

router.post('/PostNick906', async (req, res) =>{
    var result = {};
    var {nick, user_id} = req.body;
    if(!nick){
        return res.json({result: 92621});
    }
    else if(!helper.isValidNickname(nick)){
        return res.json({result: -92625});
    }
    try{
        result = await user.post006Nickname(nick, user_id);
        if(result.result != define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: U906- PostNick906/' + err);
        result.result = -92621;
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
        result.result = -92701;
        return res.json(result);
    }
});

router.get('/GetSggCode907', async (req, res) =>{
    var result ={};
    var {sido_code} = req.query;
    if(sido_code <100){
        return res.json({result: 92711});
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
        result.result = -92713;
        return res.json(result);
    }
});

router.post('/postLocationCode907', async (req, res) =>{
    var result ={};
    var {partner_id, sido_code, sgg_code} = req.body;
    if(!sido_code || !sgg_code || !partner_id || sido_code <100|| sgg_code < 100){
        return res.json({result: 92721});
    }
    try{
        result = await partner.postP007LocationCode(sido_code, sgg_code, partner_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: U907 - postLocationCode907/' + err);
        result.result = -92722;
        return res.json(result);
    }
});

router.post('/checkState910', async(req, res) =>{
    var result ={};
    var {partner_id} = req.body;
    if(!partner_id){
        return {result: 9101}
    }
    console.log(partner_id);
    try{
        result = await partner.checkState910(partner_id);
        if(result.result != define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: U910 - checkState912/' + err);
        result.result = -9101;
        return res.json(result);
    }
});

router.post('/postUpdateToken909', async (req, res) =>{
    var result ={};
    var {user_id, token} = req.body;
    try{
        result = await user.UserUpdateToken008(user_id, token);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 008 - postUserUpdateToken909/' + err);
        result.result = -909;
        return res.status(400).json(result);
    }
});

router.post('/postLogout910', async (req, res) =>{
    var result ={};
    var {user_id, token} = req.body;
    try{
        result = await user.UserDeleteToken008(user_id);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 008 - postUserLogout910/' + err);
        result.result = -910;
        return res.status(400).json(result);
    }
});

router.post('/postShutAccount911', async (req, res) =>{
    var result ={};
    var {user_id, token} = req.body;
    try{
        result = await user.UserShutAccount008(user_id);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 008 - postUserShutAccount911/' + err);
        result.result = -911;
        return res.status(400).json(result);
    }
});
//#endregion

module.exports = router;