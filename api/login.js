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
        return res.status(400).json({'status': 'either Id or Password is missing'});
    }
    if(!helper.validatePassword(req.body.login_pwd)){
        return res.status(400).json({'status': 'Please enter a valid password form'})
    }
    try{
        var dbResponse = await users.get001GetPassword(login_id);
        if(dbResponse.result != define.const_SUCCESS)
            throw(dbResponse.result);
        if(!dbResponse.data.hash_pwd){
            return res.status(404).json({'status': 'Unidentified Account'});
        }
        if(!helper.comparePassword(req.body.login_pwd, dbResponse.data.hash_pwd)){
            return res.status(400).json({'status': 'Incorrect Password'});
        }
        delete req.body.login_pwd;
        const token = helper.generateToken(dbResponse.data.user_id);
        result = {result:1, token:token};
        return res.status(200).json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: 001/' + err);
        result.result = -1;
        return res.status(400).json(result);
    }
});

router.post('/004SignIn', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id || !req.body.login_pwd) {
        return res.status(400).json({'status': 'missing values'});
    }
    if(!helper.validatePassword(req.body.login_pwd)){
        return res.status(400).json({'status': 'Please enter a valid password form'})
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
        console.log('router ERROR: 004/' + err);
        result.result = '-003a';
        return res.status(400).json(result);
    }
});
   
router.post('/004CheckId', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id) {
        result.status = 'missing values';
        return res.status(400).json(result);
    }
    try{
        result = await users.post004LoginIdCheck(login_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.status(200).json(result);
    }   
    catch(err){
        console.log('router ERROR: 004a/' + err);
        result.result = '-003b';
        return res.status(400).json(result);
    }
});
router.post('/006CheckNick', async (req, res) =>{
    var result = {};
    var {nick, user_id} = req.body;
    try{
        result = await users.post006NicknameCheck(nick, user_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.status(200).json(result);
    }   
    catch(err){
        console.log('router ERROR: s003a/' + err);
        result.result = '-006a';
        return res.status(400).json(result);
    }
});
router.post('/006PostNick', async (req, res) =>{
    var result = {};
    var {nick, user_id} = req.body;
    
    try{
        result = await users.post006Nickname(nick, user_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.status(200).json(result);
    }   
    catch(err){
        console.log('router ERROR: s003a/' + err);
        result.result = '006b';
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
        console.log('router ERROR: 007a/' + err);
        result.result = '-007a';
        return res.status(400).json(result);
    }
});

router.get('/Get007SggCode', async (req, res) =>{
    var result ={};
    var {sido_code} = req.query;
    try{
        result = await users.get007SggCode(sido_code);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 007b/' + err);
        result.result = '-007b';
        return res.status(400).json(result);
    }
});

router.post('/post007LocationCode', async (req, res) =>{
    var result ={};
    var {user_id, sido_code, sgg_code} = req.body;
    try{
        result = await users.post007LocationCode(sido_code, sgg_code, user_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 007c/' + err);
        result.result = '-007c';
        return res.status(400).json(result);
    }
})

module.exports = router;