const express = require('express');
const app = express();
const { hash } = require('bcrypt');
const router = express.Router();

const users = require('../common/query_login');
const define = require('../../definition/define');
const {helper} = require('../../controller/validate');
const {verifyToken} = require('../../middleware/verify');

app.use(express.urlencoded({limit:'50mb', extended: false }));
app.use(express.json({limit: '50mb'}));

router.get('/test', verifyToken, (req, res) =>{
    res.send('hi you are verified');
});

//user login/signup API
router.post('/Login901', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id || !req.body.login_pwd){
        return res.status(400).json({
            'result': -9001, 
            'message': 'either Id or Password is missing'
        });
    }
    if(!helper.isValidId(login_id)){
        return res.status(400).json({
            'result': -9002, 
            'message': 'Please enter a valid Id form'
        })
    }
    if(!helper.isValidPassword(req.body.login_pwd)){
        return res.status(400).json({
            'result': -9003, 
            'message': 'Please enter a valid password form'
        })
    }
    try{
        var dbResponse = await users.get001GetPassword(login_id);
        if(dbResponse.result != define.const_SUCCESS){
            return res.status(404).json({
                'result': dbResponse.result, 
                'message': dbResponse.message
            });
        }
        if(!dbResponse.data.hash_pwd){
            return res.status(404).json({'result': -9011, 'message': 'Unidentified Account'});
        }
        if(!helper.comparePassword(req.body.login_pwd, dbResponse.data.hash_pwd)){
            return res.status(400).json({'result': -9012, 'message': 'Incorrect Password'});
        }
        delete req.body.login_pwd;
        const token = helper.generateToken(dbResponse.data.user_id);
        result = {result:1, token:token};
        return res.status(200).json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: U901 - Login901/' + err);
        result.result = -901;
        result.message = err;
        return res.status(400).json(result);
    }
});
 
router.post('/SignIn904', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id || !req.body.login_pwd) {
        return res.status(400).json({
            'result': -9001, 
            'message': 'either Id or Password is missing'});
    }
    if(!helper.isValidId(login_id)){
        return res.status(400).json({
            'result': -9002, 
            'message': 'Please enter a valid Id form'})
    }
    if(!helper.isValidPassword(req.body.login_pwd)){
        return res.status(400).json({'result': -9003, 'message': 'Please enter a valid password form'})
    }
    try{
        const hash_pwd = helper.hashPassword(req.body.login_pwd);
        delete req.body.login_pwd;
        
        result = await users.post004IdPassword(login_id, hash_pwd);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.status(200).json(result);
    }   
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: U904 - SignIn904/' + err);
        result.result = -902;
        return res.status(400).json(result);
    }
});
   
router.post('/CheckId904', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id) {
        return res.status(400).json({'result': -9001, 'message': 'id is missing'});
    }
    else if(!helper.isValidId(login_id)){
        return res.status(400).json({'result': -9002, 'message': 'Please enter a valid Id form'})
    }
    try{
        result = await users.post004LoginIdCheck(login_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);        
        result.message = '가능한 아이디입니다';
        return res.status(200).json(result);
    }   
    catch(err){
        console.log('router ERROR: U904 - CheckId904/' + err);
        result.result = -903;
        return res.status(400).json(result);
    }
});

router.post('/CheckNick906', async (req, res) =>{
    var result = {};
    var {nick, user_id} = req.body;
    if(!nick){
        return res.status(400).json({'result': -9004, 'message': 'nick is missing'});
    }
    else if(!helper.isValidNickname(nick)){
        return res.status(400).json({'result': -9005, 'message': 'Please enter a valid nickname'});
    }
    try{
        result = await users.post006NicknameCheck(nick, user_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        result.Message = '가능한 닉네임입니다';
        return res.status(200).json(result);
    }   
    catch(err){
        console.log('router ERROR: 906 - CheckNick906/' + err);
        result.result = -904;
        return res.status(400).json(result);
    }
});

router.post('/PostNick906', async (req, res) =>{
    var result = {};
    var {nick, user_id} = req.body;
    if(!nick){
        return res.status(400).json({'result': -9004, 'message': 'nick is missing'});
    }
    else if(!helper.isValidNickname(nick)){
        return res.status(400).json({'result': -9005, 'message': 'Please enter a valid nickname'});
    }
    try{
        result = await users.post006Nickname(nick, user_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.status(200).json(result);
    }   
    catch(err){
        console.log('router ERROR: 906- PostNick906/' + err);
        result.result = -905;
        return res.status(400).json(result);
    }
});

router.get('/GetSdCode907', async (req, res) =>{
    var result ={};
    try{
        result = await users.get007SdCode();
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 907 - GetSdCode907/' + err);
        result.result = -906;
        return res.status(400).json(result);
    }
});

router.get('/GetSggCode907', async (req, res) =>{
    var result ={};
    var {sido_code} = req.query;
    if(sido_code <100){
        return res.status(400).json({'result': -9006, 'message': 'something wrong with sido_code input'});
    }
    try{
        result = await users.get007SggCode(sido_code);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 907 - GetSggCode907/' + err);
        result.result = -907;
        return res.status(400).json(result);
    }
});

router.post('/postLocationCode907', async (req, res) =>{
    var result ={};
    var {user_id, sido_code, sgg_code} = req.body;
    if(sido_code <100|| sgg_code < 100){
        return res.status(400).json({'result': -9006, 'message': 'something wrong with sido_code or sgg_code input'});
    }
    try{
        result = await users.post007LocationCode(sido_code, sgg_code, user_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 007 - postLocationCode907/' + err);
        result.result = -908;
        return res.status(400).json(result);
    }
});

router.post('/postUserUpdateToken909', async (req, res) =>{
    var result ={};
    var {user_id, token} = req.body;
    try{
        result = await users.UserUpdateToken008(user_id, token);
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

router.post('/postUserLogout910', async (req, res) =>{
    var result ={};
    var {user_id, token} = req.body;
    try{
        result = await users.UserDeleteToken008(user_id);
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

router.post('/postUserLogout910', async (req, res) =>{
    var result ={};
    var {user_id, token} = req.body;
    try{
        result = await users.UserShutAccount008(user_id);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 008 - postUserLogout910/' + err);
        result.result = -911;
        return res.status(400).json(result);
    }
});


module.exports = router;