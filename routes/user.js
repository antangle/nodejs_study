const express = require('express');
const app = express();
const helper = require('./user/helper').helper;
const Pool = require('./connect/pool');
app.use(express.urlencoded({limit:'50mb', extended: false }));
app.use(express.json({limit: '50mb'}));

const router = express.Router();

router.post('/signup', (req, res) =>{
    var {login_id, login_pwd} = req.body;
    if (!login_id || !login_pwd) {
        return res.status(400).send({'status': 'missing values'});
    }
//    if (!helper.isValidEmail(req.body.email)) {
//        return res.status(400).send({ 'status': 'unvalid email address' });
//    }
    const hashPassword = helper.hashPassword(login_pwd);
    
    return res.json(hashPassword);
});
router.post('/login', (req, res) =>{
    var {login_id, login_pwd} = req.body;
    if (!login_id || !login_pwd) {
        return res.status(400).send({'status': 'missing values'});
    }
//    if (!helper.isValidEmail(req.body.email)) {
//        return res.status(400).send({ 'status': 'unvalid email address' });
//    }
    const hashPassword = helper.hashPassword(login_pwd);
    
    return res.json(hashPassword);
});
module.exports = router;
