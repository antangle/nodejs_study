var express = require('express');
var router = express.Router();
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: false }));

const define = require('../definition/define')
const auction = require('./db_layer/query_myAuction');

router.get('/get201MyAuctionOn', async (req, res) =>{
    var result ={};
    var array =[]
    try{
        // 1 means ongoing auctions
        var win_state = 1;
        var {user_id} = req.query;
        result = await auction.get201AuctionInfo(user_id, win_state)
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        for(var i=0; i<result.rowCount; ++i){
            var data = await auction.getDeviceInfoWithDetail_Id(result.auction[i].device_detail_id);
            if(data.result != define.const_SUCCESS)
                throw(data.result);
            array.push(data.rows[0]);
        }
        result.selected_device_data = array;
    }
    catch(err){
        console.log('router ERROR: 201/' + err);
        result.result = -201;
    }
    finally{
        return res.json(result);
    }
});

router.get('/get202MyAuctionOff', async (req, res) =>{
    var result ={};
    var array =[]
    try{
        // 2 means confirmed auctions
        var win_state = 2;
        var {user_id} = req.query;
        result = await auction.get201AuctionInfo(user_id, win_state)
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        for(var i=0; i<result.rowCount; ++i){
            var data = await auction.getDeviceInfoWithDetail_Id(result.auction[i].device_detail_id);
            if(data.result != define.const_SUCCESS)
                throw(data.result);
            array.push(data.rows[0]);
        }
        result.selected_device_data = array;
    }
    catch(err){
        console.log('router ERROR: 202/' + err);
        result.result = -202;
    }
    finally{
        return res.json(result);
    }
});

router.get('/get203MyAuctionDetails', async (req, res) =>{
    var result ={};
    try{
        var {auction_id} = req.query;
        result = await auction.get203AuctionDeals(auction_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
    }
    catch(err){
        console.log('router ERROR: 203/' + err);
        result.result = -203;
    }
    finally{
        return res.json(result);
    }
});

router.get('/get204MyAuctionDetailsFinish', async (req, res) =>{
    var result ={};
    try{
        var {auction_id} = req.query;
        result = await auction.get204AuctionDealsFinish(auction_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
    }
    catch(err){
        console.log('router ERROR: 204/' + err);
        result.result = -204;
    }
    finally{
        return res.json(result);
    }
});

router.get('/get205FinishedDealDetails', async (req, res) =>{
    var result ={};
    try{
        var {deal_id} = req.query;
        result = await auction.get205DealDetail(deal_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        var data = await auction.getDeviceInfoWithDetail_Id(result.deal[0].device_detail_id);
        if(data.result != define.const_SUCCESS)
            throw(data.result);
        result.selected_device_data = data.rows;
    }
    catch(err){
        console.log('router ERROR: 205/' + err);
        result.result = -205;
    }
    finally{
        return res.json(result);
    }
});
//update auction win_deal_id when the auction is confirmed.
router.patch('/patch208ConfirmPopup', async (req, res) =>{
    var result ={};
    try{
        var {deal_id} = req.body;
        result = await auction.Update208DealConfirmation(deal_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
    }
    catch(err){
        console.log('router ERROR: 208/' + err);
        result.result = -208;
    }
    finally{
        return res.json(result);
    }
});

router.get('/get209ConfirmedAuction', async (req, res) =>{
    var result ={};
    try{
        var {deal_id} = req.query;
        result = await auction.get209ConfirmedAuction(deal_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
    }
    catch(err){
        console.log('router ERROR: 209/' + err);
        result.result = -209;
    }
    finally{
        return res.json(result);
    }
});

router.get('/get210InfoForReview', async (req, res) =>{
    var result ={};
    try{
        var {deal_id} = req.query;
        result = await auction.get210InfoForReview(deal_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
    }
    catch(err){
        console.log('router ERROR: 210a/' + err);
        result.result = -209;
    }
    finally{
        return res.json(result);
    }
});

router.post('/post210DealReview', async(req,res) =>{
    var result ={};
    try{
        var jsondata = req.body;
        result = await auction.insert210Review(jsondata);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
        jsondata.scoreGap = result.scoreGap;
        if(result.isScoreNull == true){
            //isScoreNull true -> the review is new or deal doesnt exist
            //doesnt matter when deal does not exist.
            jsondata.weight = 1;
            var store = await auction.update210StoreAfterReview(jsondata);
            if(store.result != define.const_SUCCESS)
                throw(store.result);
        }
        else{
            jsondata.weight = 0;
            var store = await auction.update210StoreAfterReview(jsondata);
            if(store.result != define.const_SUCCESS)
                throw(store.result);
        }
    }
    catch(err){
        console.log('router ERROR: 210b/' + err);
        result.result = -210;
    }
    finally{
        return res.json(result);
    }
});

router.get('/get211StoreDetails', async(req,res) =>{
    var result ={};
    try{
        var {store_id} = req.query;
        result = await auction.get211StoreDetails(store_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
    }
    catch(err){
        console.log('router ERROR: 211/' + err);
        result.result = -211;
    }
    finally{
        return res.json(result);
    }
});

router.get('/get212AllStoreReviews', async(req,res) =>{
    var result ={};
    try{
        var {store_id} = req.query;
        result = await auction.get212AllStoreReviews(store_id);
        if(result.result != define.const_SUCCESS)
            throw(result.result);
    }
    catch(err){
        console.log('router ERROR: 211/' + err);
        result.result = -211;
    }
    finally{
        return res.json(result);
    }
});
module.exports = router;
