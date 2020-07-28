const express = require('express');
const router = express.Router();
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: false }));

const define = require('../../definition/define')
const store = require('../db_layer/query_storeAuction')

router.get('/S101HomepageInfo', async (req, res) =>{
    var result ={};
    try{
        var {store_id} = req.query;
        myDeal = await store.get601StoreAuction(store_id);
        if(myDeal.result !== define.const_SUCCESS){
            throw(myDeal.result);
        }
        var lookaround = await store.get601Search(store_id);
        if(lookaround.result !== define.const_SUCCESS){
            throw(lookaround.result);
        }
        var review = await store.get601Reviews(store_id);
        if(review.result !== define.const_SUCCESS){
            throw(review.result);
        }
        result = {
            myDeal: myDeal.myDeal, 
            auction: lookaround.auction, 
            review: review.review, 
            result: define.const_SUCCESS
        }
    }
    catch(err){
        console.log('router ERROR: s101/' + err);
        result.result = -601;
    }
    finally{
        return res.json(result);
    }
});
router.get('/S201SearchAuction', async (req, res) =>{
    var result ={};
    try{
        var {store_id} = req.query;
        
    }
    catch(err){
        console.log('router ERROR: s201/' + err);
        result.result = -701;
    }
    finally{
        return res.json(result);
    }
});
router.post('/S201CutAuction', async (req, res) =>{
    var result ={};
    try{
        var {store_id, auction_id} = req.body;
        result = await store.post701CutAuction(store_id, auction_id);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
    }
    catch(err){
        console.log('router ERROR: s201-cut/' + err);
        result.result = -701;
    }
    finally{
        return res.json(result);
    }
});
router.delete('/S201DeleteAuction', async (req, res) =>{
    var result ={};
    try{
        result = await store.delete701CutAuction();
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
    }
    catch(err){
        console.log('router ERROR: s201-delete/' + err);
        result.result = -701;
    }
    finally{
        return res.json(result);
    }
});

router.get('/S201SearchAuction', async (req, res) =>{
    var result ={};
    try{
        var {store_id} = req.query;
        
    }
    catch(err){
        console.log('router ERROR: s201/' + err);
        result.result = -701;
    }
    finally{
        return res.json(result);
    }
});
module.exports = router;

