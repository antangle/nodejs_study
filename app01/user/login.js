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
    try{
        var {login_id, push_token} = req.body;
        if(!push_token){
            push_token = null;
        }
        if (!login_id || !req.body.login_pwd) {
            return res.json({result: -9211});
        }
        var dbResponse = await user.getU001GetPassword(login_id);
        if(dbResponse.result !== define.const_SUCCESS){
            return res.json({result: dbResponse.result});
        }
        //회원탈퇴
        if(dbResponse.data.state === -1){
            return res.json({result: 9215, state: dbResponse.data.state});
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
        //push_token 업데이트
        var push = await user.updatePushTokenUser(login_id, push_token);
        if(push.result !== define.const_SUCCESS){
            return res.json(push);
        }
        const token = helper.generateToken(dbResponse.data.user_id);
        result = {
            token: token, 
            user_id: dbResponse.data.user_id,
            nick: dbResponse.data.nick,
            sgg_code: dbResponse.data.sgg_code,
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
    try{
        if(!name|| !mobileno || !birthdate || !dupinfo){
            return res.json({result: 9221});
        }
        var json = {
            name: name, 
            mobileno: mobileno, 
            birthdate: birthdate,
            dupinfo: dupinfo
        };
        var encryptedData = helper.encryptJson(json);
        if(encryptedData === -9222){
            return res.json({result: encryptedData})
        }
        return res.json({result: 1, encryptedData: encryptedData});
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
    try{
        if(!info){
            return res.json({result: -92234});
        }
        var {dupinfo} = jwt.decode(info);
        result = await user.checkDupinfoUser(dupinfo);
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
    var {login_id, push_token} = req.body;
    try{
        if(!push_token){
            push_token = null;
        }
        if (!login_id) {
            return res.json({result: -9231});
        }
        else if(!helper.isValidId(login_id)){
            return res.json({result: -9231})
        }
        result = await user.postU004LoginIdCheck(login_id);
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
    var {login_id, info, push_token} = req.body;
    try{
        if(!push_token){
            push_token = null;
        }
        if(!info){
            return res.json({result: 9241});
        }
        if(!login_id || !req.body.login_pwd) {
            return res.json({result: 9241});
        }
        if(!helper.isValidId(login_id)|| !helper.isValidPassword(req.body.login_pwd)){
            return res.json({result: -9241});
        }
        //hash password
        const hash_pwd = helper.hashPassword(req.body.login_pwd);
        delete req.body.login_pwd;
        //jwt decode
        var user_info = jwt.decode(info);

        var check = await user.checkDupinfoUser(user_info.dupinfo);
        //dup 중복
        if(check.result !== define.const_SUCCESS){
            return res.json({result: 9242});
        }
        result = await user.postU004IdPassword(login_id, hash_pwd, user_info);
        //새 계정 insert
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        var push = await user.updatePushTokenUser(login_id, push_token);
        if(push.result !== define.const_SUCCESS){
            return res.json(push);
        }
        const token = helper.generateToken(result.user_id);
        result.token = token
        return res.json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: U904 - SignIn904/' + err);
        result.result = -9243;
        return res.json(result);
    }
});

router.post('/CheckNick906', async (req, res) =>{
    var result = {};
    var {nick, user_id} = req.body;
    try{
        if(!nick || !user_id){
            return res.json({result: 92612});
        }
        else if(!helper.isValidNickname(nick)){
            return res.json({result: -92615});
        }
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
    try{
        if(!nick){
            return res.json({result: 92621});
        }
        else if(!helper.isValidNickname(nick)){
            return res.json({result: -92625});
        }
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
        result = await user.get007SdCode();
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
    try{
        if(!sido_code){
            return res.json({result: 92711});
        }
        else if(sido_code <100 || sido_code > 1700){
            return res.json({result: 92711});
        }
        result = await user.get007SggCode(sido_code);
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
    var {user_id, sido_code, sgg_code} = req.body;
    try{
        if(!sido_code || !sgg_code || !user_id){
            return res.json({result: 92721});
        }
        result = await user.postU007LocationCode(sido_code, sgg_code, user_id);
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
    var {user_id} = req.body;
    console.log(user_id);
    try{
        if(!user_id){
            return {result: 9301}
        }
        result = await user.checkUserState910(user_id);
        if(result.result != define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: U910 - checkUserState910/' + err);
        result.result = -9301;
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