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

router.post('/partner_login', async (req, res) =>{
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
        var dbResponse = await partner.getP001GetPassword(login_id);
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
        const token = helper.generateToken(dbResponse.data.partner_id);
        result = {result:1, token:token};
        return res.status(200).json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: P001 - partner_login/' + err);
        result.result = -921;
        result.message = err;
        return res.status(400).json(result);
    }
});
 
router.post('/P004SignIn', async (req, res) =>{
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
        
        result = await partner.postP004IdPassword(login_id, hash_pwd);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.status(200).json(result);
    }   
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: P004SignIn/' + err);
        result.result = -922;
        return res.status(400).json(result);
    }
});
   
router.post('/P004CheckId', async (req, res) =>{
    var result = {};
    var {login_id} = req.body;
    if (!login_id) {
        return res.status(400).json({'result': -9001, 'message': 'id is missing'});
    }
    else if(!helper.isValidId(login_id)){
        return res.status(400).json({'result': -9002, 'message': 'Please enter a valid Id form'})
    }
    try{
        result = await partner.postP004LoginIdCheck(login_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);        
        result.message = '가능한 아이디입니다';
        return res.status(200).json(result);
    }   
    catch(err){
        console.log('router ERROR: P004CheckId/' + err);
        result.result = -923;
        return res.status(400).json(result);
    }
});

router.post('/postP007LocationCode', async (req, res) =>{
    var result ={};
    var {partner_id, sido_code, sgg_code} = req.body;
    if(sido_code <100|| sgg_code < 100){
        return res.status(400).json({'result': -9006, 'message': 'something wrong with sido_code or sgg_code input'});
    }
    try{
        result = await partner.postP007LocationCode(sido_code, sgg_code, partner_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: P007 - postP007LocationCode/' + err);
        result.result = -924;
        return res.status(400).json(result);
    }
})

router.post('/partnerToStore', async(req, res) =>{
    var result ={};
    var {partner_id} = req.body;
    try{
        result = await partner.PartnerToStore(partner_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: store1 - partnerToStore/' + err);
        result.result = -925;
        return res.status(400).json(result);
    }
})

router.post('/postP008PartnerUpdateToken', async (req, res) =>{
    var result ={};
    var {partner_id, token} = req.body;
    try{
        result = await partner.PartnerUpdateTokenP008(partner_id, token);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 008 - post008PartnerUpdateToken/' + err);
        result.result = -909;
        return res.status(400).json(result);
    }
});

router.post('/postP008PartnerDeleteToken', async (req, res) =>{
    var result ={};
    var {partner_id, token} = req.body;
    try{
        result = await partner.PartnerDeleteTokenP008(partner_id);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 008 - post008PartnerDeleteToken/' + err);
        result.result = -910;
        return res.status(400).json(result);
    }
});

router.post('/postP008PartnerShutAccount', async (req, res) =>{
    var result ={};
    var {partner_id, token} = req.body;
    try{
        result = await partner.PartnerShutAccountP008(partner_id);
        if(result.result != define.const_SUCCESS){
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 008 - post008PartnerShutAccount/' + err);
        result.result = -911;
        return res.status(400).json(result);
    }
});

module.exports = router;