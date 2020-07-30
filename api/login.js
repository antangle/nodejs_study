const express = require('express');
const app = express();
const { hash } = require('bcrypt');
const router = express.Router();

const users = require('./db_layer/query_login');
const define = require('../definition/define');
const {helper} = require('../controller/validate');
const {verifyToken} = require('../middleware/verify');

app.use(express.urlencoded({limit:'50mb', extended: false }));
app.use(express.json({limit: '50mb'}));

router.get('/test', verifyToken, (req, res) =>{
    res.send('hi you are verified');
});


router.post('/login', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id || !req.body.login_pwd) {
        return res.status(400).json({'result': -9001, 'errMessage': 'either Id or Password is missing'});
    }
    if(!helper.isValidId(login_id)){
        return res.status(400).json({'result': -9002, 'errMessage': 'Please enter a valid Id form'})
    }
    if(!helper.validatePassword(req.body.login_pwd)){
        return res.status(400).json({'result': -9003, 'errMessage': 'Please enter a valid password form'})
    }
    try{
        var dbResponse = await users.get001GetPassword(login_id);
        if(dbResponse.result != define.const_SUCCESS)
            throw(dbResponse.result);
        if(!dbResponse.data.hash_pwd){
            return res.status(404).json({'result': -9011, 'errMessage': 'Unidentified Account'});
        }
        if(!helper.comparePassword(req.body.login_pwd, dbResponse.data.hash_pwd)){
            return res.status(400).json({'result': -9012, 'errMessage': 'Incorrect Password'});
        }
        delete req.body.login_pwd;
        const token = helper.generateToken(dbResponse.data.user_id);
        result = {result:1, token:token};
        return res.status(200).json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: 001 - login/' + err);
        result.result = -901;
        return res.status(400).json(result);
    }
});
 
router.post('/004SignIn', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id || !req.body.login_pwd) {
        return res.status(400).json({'result': -9001, 'errMessage': 'either Id or Password is missing'});
    }
    if(!helper.isValidId(login_id)){
        return res.status(400).json({'result': -9002, 'errMessage': 'Please enter a valid Id form'})
    }
    if(!helper.validatePassword(req.body.login_pwd)){
        return res.status(400).json({'result': -9003, 'errMessage': 'Please enter a valid password form'})
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
        console.log('router ERROR: 004SignIn/' + err);
        result.result = -902;
        return res.status(400).json(result);
    }
});
   
router.post('/004CheckId', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id) {
        return res.status(400).json({'result': -9001, 'errMessage': 'id is missing'});
    }
    else if(!helper.isValidId(login_id)){
        return res.status(400).json({'result': -9002, 'errMessage': 'Please enter a valid Id form'})
    }
    try{
        result = await users.post004LoginIdCheck(login_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.status(200).json(result);
    }   
    catch(err){
        console.log('router ERROR: 004CheckId/' + err);
        result.result = -903;
        return res.status(400).json(result);
    }
});
router.post('/006CheckNick', async (req, res) =>{
    var result = {};
    var {nick, user_id} = req.body;
    if(!nick){
        return res.status(400).json({'result': -9004, 'errMessage': 'nick is missing'});
    }
    else if(!helper.isValidNickname(nick)){
        return res.status(400).json({'result': -9005, 'errMessage': 'Please enter a valid nickname'});
    }
    try{
        result = await users.post006NicknameCheck(nick, user_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.status(200).json(result);
    }   
    catch(err){
        console.log('router ERROR: 006 - CheckNick/' + err);
        result.result = -904;
        return res.status(400).json(result);
    }
});
router.post('/006PostNick', async (req, res) =>{
    var result = {};
    var {nick, user_id} = req.body;
    if(!nick){
        return res.status(400).json({'result': -9004, 'errMessage': 'nick is missing'});
    }
    else if(!helper.isValidNickname(nick)){
        return res.status(400).json({'result': -9005, 'errMessage': 'Please enter a valid nickname'});
    }
    try{
        result = await users.post006Nickname(nick, user_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.status(200).json(result);
    }   
    catch(err){
        console.log('router ERROR: 006- PostNick/' + err);
        result.result = -905;
        return res.status(400).json(result);
    }
});
router.get('/Get007SdCode', async (req, res) =>{
    var result ={};
    try{
        result = await users.get007SdCode();
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 007 - GetSidoCode/' + err);
        result.result = -906;
        return res.status(400).json(result);
    }
});

router.get('/Get007SggCode', async (req, res) =>{
    var result ={};
    var {sido_code} = req.query;
    if(sido_code <100){
        return res.status(400).json({'result': -9006, 'errMessage': 'something wrong with sido_code input'});
    }
    try{
        result = await users.get007SggCode(sido_code);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 007 - GetSggCode/' + err);
        result.result = -907;
        return res.status(400).json(result);
    }
});

router.post('/post007LocationCode', async (req, res) =>{
    var result ={};
    var {user_id, sido_code, sgg_code} = req.body;
    if(sido_code <100|| sgg_code < 100){
        return res.status(400).json({'result': -9006, 'errMessage': 'something wrong with sido_code or sgg_code input'});
    }
    try{
        result = await users.post007LocationCode(sido_code, sgg_code, user_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 007 - post007LocationCode/' + err);
        result.result = -908;
        return res.status(400).json(result);
    }
})

module.exports = router;