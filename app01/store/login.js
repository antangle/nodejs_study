const express = require('express');
const app = express();
const { hash } = require('bcrypt');
const router = express.Router();

const partner = require('../common/query_login');
const define = require('../../definition/define');
const {helper} = require('../../controller/validate');
const {verifyToken} = require('../../middleware/verify');

app.use(express.urlencoded({limit:'50mb', extended: false }));
app.use(express.json({limit: '50mb'}));

router.get('/test', verifyToken, (req, res) =>{
    res.send('hi you are verified');
});

//partner login/signup API
router.post('/Login901', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id || !req.body.login_pwd){
        return res.json({
            'result': 2,
            'message': 'either Id or Password is missing'
        });
    }
    if(!helper.isValidId(login_id)){
        return res.json({
            'result': 3, 
            'message': 'Please enter a valid Id form'
        })
    }
    if(!helper.isValidPassword(req.body.login_pwd)){
        return res.json({
            'result': 4, 
            'message': 'Please enter a valid password form'
        });
    }
    try{
        var dbResponse = await partner.getP001GetPassword(login_id);
        console.log(dbResponse)
        if(dbResponse.result !== define.const_SUCCESS){
            return res.json({result: dbResponse.result});
        }
        if(!dbResponse.data.hash_pwd){
            return res.json({'result': 5, 'message': 'Unidentified Account'});
        }
        if(!helper.comparePassword(req.body.login_pwd, dbResponse.data.hash_pwd)){
            return res.json({'result': 6, 'message': 'Incorrect Password'});
        }
        delete req.body.login_pwd;
        const token = helper.generateToken(dbResponse.data.partner_id);
        result = {result:1, token: token, partner_id: dbResponse.data.partner_id};
        return res.json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: P901 - Login901/' + err);
        result.result = -921;
        result.message = err;
        return res.json(result);
    }
});
 
router.post('/SignIn904', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id || !req.body.login_pwd) {
        return res.status(400).json({
            'result': 2, 
            'message': 'either Id or Password is missing'});
    }
    if(!helper.isValidId(login_id)){
        return res.status(400).json({
            'result': 3, 
            'message': 'Please enter a valid Id form'})
    }
    if(!helper.isValidPassword(req.body.login_pwd)){
        return res.status(400).json({'result': 4, 'message': 'Please enter a valid password form'})
    }
    try{
        const hash_pwd = helper.hashPassword(req.body.login_pwd);
        delete req.body.login_pwd;
        
        result = await partner.postP004IdPassword(login_id, hash_pwd);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.status(200).json(result);
    }   
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: P904 - SignIn904/' + err);
        result.result = -922;
        return res.status(400).json(result);
    }
});
   
router.post('/CheckId904', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id) {
        return res.status(400).json({'result': 1, 'message': 'id is missing'});
    }
    else if(!helper.isValidId(login_id)){
        return res.status(400).json({'result': 2, 'message': 'Please enter a valid Id form'})
    }
    try{
        result = await partner.postP004LoginIdCheck(login_id);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        result.message = '가능한 아이디입니다';
        return res.status(200).json(result);
    }   
    catch(err){
        console.log('router ERROR: P904 - CheckId904/' + err);
        result.result = -923;
        return res.status(400).json(result);
    }
});

router.get('/GetSdCode907', async (req, res) =>{
    var result ={};
    try{
        result = await users.get007SdCode();
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 007 - GetSidoCode/' + err);
        result.result = -924;
        return res.status(400).json(result);
    }
});

router.get('/GetSggCode907', async (req, res) =>{
    var result ={};
    var {sido_code} = req.query;
    if(sido_code <100){
        return res.status(400).json({'result': 7, 'message': 'sido_code does not exist'});
    }
    try{
        result = await users.get007SggCode(sido_code);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 007 - GetSggCode/' + err);
        result.result = -925;
        return res.status(400).json(result);
    }
});

router.post('/postLocationCode907', async (req, res) =>{
    var result ={};
    var {partner_id, sido_code, sgg_code} = req.body;
    if(sido_code <100|| sgg_code < 100){
        return res.status(400).json({'result': 7, 'message': 'sido_code or sgg_code does not exist'});
    }
    try{
        result = await partner.postP007LocationCode(sido_code, sgg_code, partner_id);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: P907 - postLocationCode907/' + err);
        result.result = -926;
        return res.status(400).json(result);
    }
})

router.post('/partnerToStore908', async(req, res) =>{
    var result ={};
    var {partner_id} = req.body;
    try{
        result = await partner.PartnerToStore908(partner_id);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: p908 - partnerToStore908/' + err);
        result.result = -927;
        return res.status(400).json(result);
    }
})

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