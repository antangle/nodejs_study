const express = require('express');
const app = express();
const { hash } = require('bcrypt');
const router = express.Router();

const {helper} = require('../controller/validate');
const define = require('../definition/define')
const {verifyToken} = require('../middleware/verify');
const store = require('./db_layer/query_login')
app.use(express.urlencoded({limit:'50mb', extended: false }));
app.use(express.json({limit: '50mb'}));

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
        var dbResponse = await store.getS001GetPassword(login_id);
        if(dbResponse.result != define.const_SUCCESS)
            throw(dbResponse.result);
        if(!dbResponse.data.hash_pwd){
            return res.status(404).json({'status': 'Unidentified Account'});
        }
        if(!helper.comparePassword(req.body.login_pwd, dbResponse.data.hash_pwd)){
            return res.status(400).json({'status': 'Incorrect Password'});
        }

        delete req.body.login_pwd;
        const token = helper.generateToken(dbResponse.data.store_id);
        result = {result:1, token:token};
        return res.status(200).json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: s001/' + err);
        result.result = '-s001';
        return res.status(400).json(result);
    }
});

router.post('/s003SignIn', async (req, res) =>{
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
        
        result = await store.postS003IdPassword(login_id, hash_pwd);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.status(200).json(result);
    }   
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: s003/' + err);
        result.result = '-s003';
        return res.status(400).json(result);
    }
});

router.post('/s003CheckId', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id) {
        result.status = 'missing values';
        return res.status(400).json(result);
    }
    try{
        result = await store.postS003LoginIdCheck(login_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.status(200).json(result);
    }   
    catch(err){
        console.log('router ERROR: s003a/' + err);
        result.result = '-s003a';
        return res.status(400).json(result);
    }
});
router.post('/s004PostBusinessInfo', async (req, res) =>{
    var result = {};
    var {uuid, name, trade_name, phone, phone_1, address, store_id} = req.body;
    var postArray = [uuid, name, trade_name, phone, phone_1, address, store_id];
    try{
        result = await store.postS004StoreInfo(postArray);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        result.store_id = store_id;
        return res.status(200).json(result);
    }   
    catch(err){
        console.log('router ERROR: s004/' + err);
        result.result = -504;
        return res.status(400).json(result);
    }
});

router.get('/Get007SdCode', async (req, res) =>{
    var result ={};
    try{
        result = await store.get007SdCode();
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s007a/' + err);
        result.result = '-s007a';
        return res.status(400).json(result);
    }
});

router.get('/Get007SggCode', async (req, res) =>{
    var result ={};
    var {sido_code} = req.query;
    try{
        result = await store.get007SggCode(sido_code);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s007b/' + err);
        result.result = '-s007b';
        return res.status(400).json(result);
    }
});

router.post('/s007PostLocationCode', async (req, res) =>{
    var result ={};
    var {store_id, sido_code, sgg_code} = req.body;
    try{
        result = await store.posts007LocationCode(sido_code, sgg_code, store_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s007c/' + err);
        result.result = '-s007c';
        return res.status(400).json(result);
    }
})

module.exports = router;