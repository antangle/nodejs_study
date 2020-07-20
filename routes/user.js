const express = require('express');
const app = express();
const { hash } = require('bcrypt');
const helper = require('../controller/validate').helper;
const Pool = require('./connect/pool');
const query = Pool.query;
const {verifyToken} = require('../middleware/verify');
app.use(express.urlencoded({limit:'50mb', extended: false }));
app.use(express.json({limit: '50mb'}));


const router = express.Router();

router.get('/test', verifyToken, (req, res) =>{
    res.send('hi you are verified');
});

router.post('/signup', async (req, res) =>{
    var result = {};
    var {login_id, login_pwd} = req.body;
    if (!login_id || !login_pwd) {
        return res.status(400).send({'status': 'missing values'});
    }
    if(!helper.validatePassword(login_pwd)){
        return res.status(400).send({'result': 'Please enter a valid password form'})
    }
    try{
        var id = Date.now();
        const hashPassword = helper.hashPassword(login_pwd);
        const querytext = `
        INSERT INTO users(id, login_id, login_pwd)
        VALUES($1, $2, $3)
        `;
        await query(querytext, [id ,login_id, hashPassword]);
        const token1 = helper.generateToken(login_id);
        result = {result: 1, token: token1}
        return res.status(200).send(result);
    }   
    catch(err){
        console.log(err);
        result.result ='fail';
        return res.status(400).send(result);
    }

});

router.post('/login', async (req, res) =>{
    var {login_id, login_pwd} = req.body;
    if (!login_id || !login_pwd) {
        return res.status(400).send({'status': 'missing values'});
    }
    if(!helper.validatePassword(login_pwd)){
        return res.status(400).send({'result': 'Please enter a valid password form'})
    }
    try{
        const querytext = `
        SELECT id, login_pwd FROM users
        WHERE login_id = $1
        `;
        const {rows} = await query(querytext, [login_id]);
        const dbResponse = rows[0];
        if(!dbResponse){
            return res.status(404).send('Unidentified ID')
        }
        if(!helper.comparePassword(login_pwd, dbResponse.login_pwd)){
            console.log('hashing is hell')
            return res.status(400).send('Incorrect Password');
        }
        console.log(dbResponse)
        const token1 = helper.generateToken(dbResponse.id, login_id);
        var result = {result: 1, token: token1}
        return res.status(200).send(result);
    }   
    catch(err){
        console.log(err);
        var result = {result: 'fail'}
    }
});
module.exports = router;