var express = require('express');
var router = express.Router();
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: false }));

const define = require('../../definition/define')
const auction = require('../db_layer/query_myAuction');
const { const_SUCCESS } = require('../../definition/define');

router.get('/get201MyAuctionOn', async (req, res) =>{
    var result ={};
    var array =[]
    var {user_id} = req.query;
    try{
        await auction.update201AuctionState(user_id);
        result = await auction.get201AuctionInfo(user_id)
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        for(var i=0; i<result.rowCount; ++i){
            var data = await auction.getDeviceInfoWithDetail_Id(result.auction[i].device_detail_id);
            if(data.result !== define.const_SUCCESS)
                throw(data.result);
            array.push(data.rows[0]);
        }
        result.selected_device_data = array;
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 201/' + err);
        result.result = -201;
        return res.json(result);
    }
});
router.post('/get201StateUpdate', async (req, res) =>{
    var result ={};
    var {finish_time} = req.body;
    try{
        //state, -1: unselected, 1: ongoing, 2: waiting selection
        const currentTime = Date.now() + 32400000
        const finishTime = new Date(finish_time).valueOf()
        if(finishTime + 3600000 < currentTime){
            result= {result: define.const_SUCCESS, state: -1}
        }
        else if(finishTime < currentTime){
            result= {result: define.const_SUCCESS, state: 2}
        }
        else if(finishTime >= currentTime){
            result= {result: define.const_SUCCESS, state: 1}
        }
        else{
            throw('undefined ERROR')
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 201a/' + err);
        result.result = -201;
        return res.json(result);
    }
});
router.get('/get202MyAuctionOff', async (req, res) =>{
    var result ={};
    var array =[]
    try{
        var {user_id} = req.query;
        result = await auction.get202AuctionInfo(user_id)
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        for(var i=0; i<result.rowCount; ++i){
            var data = await auction.getDeviceInfoWithDetail_Id(result.auction[i].device_detail_id);
            if(data.result !== define.const_SUCCESS)
                throw(data.result);
            array.push(data.rows[0]);
        }
        result.selected_device_data = array;
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 202/' + err);
        result.result = -202;
        return res.json(result);
    }
});
router.get('/get203MyAuctionDetails', async (req, res) =>{
    var result ={};
    try{
        var {auction_id} = req.query;
        result = await auction.get203AuctionDeals(auction_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 203/' + err);
        result.result = -203;
        return res.json(result);
    } 
});
router.get('/get204MyAuctionDetailsFinish', async (req, res) =>{
    var result ={};
    try{
        var {auction_id} = req.query;
        result = await auction.get204AuctionDealsFinish(auction_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 204/' + err);
        result.result = -204;
        return res.json(result);
    } 
});

router.get('/get205DealDetails', async (req, res) =>{
    var result ={};
    try{
        var {deal_id} = req.query;
        result = await auction.get205DealDetail(deal_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        var data = await auction.getDeviceInfoWithDetail_Id(result.deal[0].device_detail_id);
        if(data.result !== define.const_SUCCESS)
            throw(data.result);
        result.selected_device_data = data.rows;
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 205/' + err);
        result.result = -205;
        return res.json(result);
    }
});
//update auction win_deal_id when the auction is confirmed.
router.patch('/patch208ConfirmPopup', async (req, res) =>{
    var result ={};
    try{
        var {deal_id} = req.body;
        result = await auction.Update208DealConfirmation(deal_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 208/' + err);
        result.result = -208;
        return res.json(result);
    }
    
});

router.get('/get209ConfirmedAuction', async (req, res) =>{
    var result ={};
    try{
        var {deal_id} = req.query;
        result = await auction.get209ConfirmedAuction(deal_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 209/' + err);
        result.result = -209;
        return res.json(result);
    }
});

router.get('/get210InfoForReview', async (req, res) =>{
    var result ={};
    try{
        var {deal_id} = req.query;
        result = await auction.get210InfoForReview(deal_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 210a/' + err);
        result.result = -209;
        return res.json(result);
    }
});

router.post('/post210DealReview', async(req,res) =>{
    var result ={};
    try{
        var jsondata = req.body;
        result = await auction.insert210Review(jsondata);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        jsondata.scoreGap = result.scoreGap;
        if(result.isScoreNull == true){
            //isScoreNull true -> the review is new or deal doesnt exist
            //doesnt matter when deal does not exist.
            jsondata.weight = 1;
            //scoreGap, weight, deal_id is in jsondata
            var store = await auction.update210StoreAfterReview(jsondata);
            if(store.result !== define.const_SUCCESS)
                throw(store.result);
        }
        else{
            jsondata.weight = 0;
            var store = await auction.update210StoreAfterReview(jsondata);
            if(store.result !== define.const_SUCCESS)
                throw(store.result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 210b/' + err);
        result.result = -210;
        return res.json(result);
    }
    
});

router.get('/get211StoreDetails', async(req,res) =>{
    var result ={};
    try{
        var {deal_id} = req.query;
        result = await auction.get211StoreDetails(deal_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 211/' + err);
        result.result = -211;
        return res.json(result);
    }
    
});

router.get('/get212AllStoreReviews', async(req,res) =>{
    var result ={};
    try{
        var {store_id} = req.query;
        console.log(store_id)
        result = await auction.get212AllStoreReviews(store_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 211/' + err);
        result.result = -211;
        return res.json(result);
    }
    
});
module.exports = router;
