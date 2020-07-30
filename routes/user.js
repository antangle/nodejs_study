const express = require('express');
const app = express();
const helper = require('./user/helper').helper;
const Pool = require('./connect/pool');
const { hash } = require('bcrypt');
const query = Pool.query;
app.use(express.urlencoded({limit:'50mb', extended: false }));
app.use(express.json({limit: '50mb'}));

const router = express.Router();

router.post('/signup', async (req, res) =>{
    try{
    var {login_id, login_pwd, email} = req.body;
    if (!login_id || !login_pwd) {
        return res.status(400).send({'status': 'missing values'});
    }
    if (!helper.isValidEmail(req.body.email)) {
        return res.status(400).send({ 'status': 'unvalid email address' });
    }
    const hashPassword = helper.hashPassword(login_pwd);
    console.log(hashPassword);
    const querytext = `
    INSERT INTO users(login_id, login_pwd, email)
    VALUES($1, $2, $3)
    RETURNING *
    `;
    const {rows} = await query(querytext, [login_id, hashPassword, email])
    console.log(rows);
    var result = {status: 'fail', data: rows}
    }
    catch(err){
        var result = {status: 'fail'}
    }
    finally{
        return res.json(result);
    }
});
router.post('/login', (req, res) =>{
    var {login_id, login_pwd} = req.body;
    if (!login_id || !login_pwd) {
        return res.status(400).send({'status': 'missing values'});
    }
    if (!helper.isValidEmail(req.body.email)) {
        return res.status(400).send({ 'status': 'unvalid email address' });
    }
    
    return res.json(hashPassword);
});
module.exports = router;
