const express = require('express');
const router = express.Router();
const define = require('../../definition/define')
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: false }));


router.get('/S100HomepageInfo', async (req, res) =>{
    
});




module.exports = router;

