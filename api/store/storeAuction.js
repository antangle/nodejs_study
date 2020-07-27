const express = require('express');
const router = express.Router();
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: false }));

const define = require('../../definition/define')
const auction = require('../db_layer/query_storeAuction')

router.get('/S100HomepageInfo', async (req, res) =>{
    var result ={};
    try{
        
        var {store_id} = req.query;
        result = await auction.get6011StoreAuction(store_id);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
    }
    catch(err){
        console.log('router ERROR: 131/' + err);
        result.result = -601;
    }
    finally{
        return res.json(result);
    }
});




module.exports = router;

