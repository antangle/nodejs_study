var express = require('express');
var router = express.Router();
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: false }));

const define = require('../../definition/define')
const {helper} = require('../../controller/validate');
const myPage = require('../db_layer/query_myPage');

router.get('/myPageNeededInfo401', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.query;
        if(!user_id){
            return res.json({result: 4011});
        }
        result = await myPage.myPageNeededInfo401(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result)
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: myPageNeededInfo401/' + err);
        result.result = -4011;
        return res.json(result);
    }
});

router.post('/myPageHelp402', async(req,res) =>{
    var result ={};
    try{
        var {user_id, type, comment} = req.body;
        if(!user_id || !type ||!comment){
            return res.json({result: 4021});
        }
        result = await myPage.myPageHelp402(user_id, type, comment);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: myPageHelp402/' + err);
        result.result = -4021;
        return res.json(result);
    }
});

router.get('/myReview403', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.query;
        if(!user_id){
            return res.json({result: 4032});
        }
        result = await myPage.myReview403(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: myReview403/' + err);
        result.result = -4031;
        return res.json(result);
    }
});

router.post('/CheckNick404', async (req, res) =>{
    var result = {};
    var {nick} = req.body;
    if(!nick){
        return res.json({result: 40401});
    }
    else if(!helper.isValidNickname(nick)){
        return res.json({result: -40401});
    }
    try{
        result = await myPage.CheckNick404(nick);
        if(result.result != define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }   
    catch(err){
        console.log('router ERROR: 4040 - CheckNick404/' + err);
        result.result = -4040;
        return res.json(result);
    }
});

router.post('/changeNick404', async (req, res) =>{
    var result = {};
    var {nick, user_id} = req.body;
    if(!nick || !user_id){
        return res.json({result: 40411});
    }
    else if(!helper.isValidNickname(nick)){
        return res.json({result: -40411});
    }
    try{
        result = await myPage.changeNick404(nick, user_id);
        if(result.result != define.const_SUCCESS){
            return res.json(result);
        }
        return res.json({result: result.result});
    }
    catch(err){
        console.log('router ERROR: 4041- PostNick404/' + err);
        result.result = -4041;
        return res.json(result);
    }
});

router.post('/changePlace405', async(req,res) =>{
    var result ={};
    var {user_id, sido_code, sgg_code} = req.body;
    if(!sido_code || !sgg_code || !user_id || sido_code <100|| sgg_code < 100){
        return res.json({result: 40511});
    }
    try{
        result = await myPage.post007LocationCode(sido_code, sgg_code, user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: changePlace405/' + err);
        result.result = -4050;
        return res.json(result);
    }
});

router.post('/changePassword406', async(req,res) =>{
    var result ={};
    var {user_id} = req.body;
    //old_pwd: 과거 비번, new_pwd: 바뀌는 비번
    if(!user_id || !req.body.old_pwd || !req.body.new_pwd){
        //input 존재하지 않음
        return res.json({result: 40601})
    }
    if(!helper.isValidPassword(req.body.new_pwd)){
        return res.json({result: -40605})
    }
    try{
        const pwd = await myPage.getUserPassword406(user_id);
        if(pwd.result !== define.const_SUCCESS){
            //getUserPassword405에서 뭔가 실패
            return res.json({result: pwd.result});
        }
        if(!helper.comparePassword(req.body.old_pwd, pwd.hash_pwd)){
            //비번이 다름
            return res.json({result: 40602});
        }
        const hash_pwd = helper.hashPassword(req.body.new_pwd);
        delete req.body.login_pwd;

        result = await myPage.changeUserPassword406(user_id, hash_pwd);
        if(result.result !== define.const_SUCCESS){
            return res.json({result: result.result});
        }
        return res.json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: changePassword406/' + err);
        result.result = -4060;
        return res.json(result);
    }
});

router.post('/UserShutAccount410', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.body;
        if(!user_id){
            return res.json({result: -4102});
        }
        result = await myPage.UserShutAccount410(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: getOut410/' + err);
        result.result = -4101;
        return res.json(result);
    }
});

module.exports = router;
