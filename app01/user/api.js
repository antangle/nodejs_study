const express = require('express');
const router = express.Router();
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: false }));

const buy = require('../common/query_buy');
const auction = require('../common/query_myAuction');
const define = require('../../definition/define')

router.get('/test', async(req, res)=>{
    try{
        var {device_id} = req.query;
        var result = {}
        /*
        for(var device_id=1; device_id<52; ++device_id){
            result = await store.test(device_id);
            if(!result.errDevice){
            for(var i=0; i<result.rowCount; ++i){
                if(result.rows[i].discount_official === null){
                    array.push(result.rows[i].device_id)
                    break;
                }
            }
        }
        */
        result = await buy.test(device_id);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: test - /' + err);
        result.result = -1;
        return res.json(result);
    }
});
  
router.get('/getHomepageDevice', async (req, res) =>{
    var result ={};
    try{
        result = await buy.get100LatestDeviceHomepage(); 
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 100/' + err);
        result.result = -100;
        return res.json(result);
    }
});

router.get('/countAuction', async (req, res) =>{
    var result ={};
    try{
        var {user_id} = req.query;
        result = await buy.countAuctions(user_id); 
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
        }
    catch(err){
        console.log('router ERROR: 100/' + err);
        result.result = -100;
        return res.json(result);
    }
});

router.get('/getStep1Latest', async(req,res) =>{
    var result ={};
    try{
        var {user_id, device_id} = req.query;
        result = await buy.getAuctionTempWithUser(user_id, device_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        var latestDevices = await buy.getStep1Latest6();
        if(latestDevices.result != define.const_SUCCESS)
            throw latestDevices.result;
        result.device_array = latestDevices.device_array;
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 101/' + err);
        result.result = -101;
        return res.json(result);
    }
});

router.get('/getStep1WithBrand', async(req, res) => {
    var result ={};
    try{
        var {user_id, device_id, brand_id} = req.query;
        result = await buy.getAuctionTempWithUser(user_id, device_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        result = await buy.getStep1DeviceByBrand(brand_id);
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 102/' + err);
        result.result = -102;
        return res.json(result);
    }
});

router.post('/postSaveStep1', async(req, res) =>{
    var result ={};
    try{
        var {user_id, device_id} = req.body;
        var {state, temp_device_id} = await buy.checkIsFirstAuction(user_id);
        if(state === define.const_DEAD || temp_device_id !== define.const_NULL){
            const postInfo = await buy.postStep1Update(user_id, device_id);
            if(postInfo.result != define.const_SUCCESS)
                throw(postInfo.result);
            result.result = define.const_SUCCESS;
        }
        if (temp_device_id === define.const_NULL){
            const postInfo = await buy.postStep1Insert(user_id, device_id);
            if(postInfo.result != define.const_SUCCESS)
                throw(postInfo.result);
            result.result = define.const_SUCCESS;
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 103/' + err);
        result.result = -103;
        return res.json(result);
    }
});

//step:2
router.get('/getStep2ColorVolume', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.query;
        result = await buy.getAuctionTempWithUser(user_id);
        if(result.state === define.const_DEAD || result.temp_device_id === define.const_NULL){
            result.result = -1111;
            console.log('this user\'s state or device_id is either NULL or DEAD');
            throw(result.result)
        }
        var device_id = result.temp_device_id;
        var data = await buy.getStep2ColorVolume(device_id);
        result.rowCount = data.rowCount;
        result.data = data.data;
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 111/' + err);
        result.result = -111;
        return res.json(result);
    }
});

router.post('/postSaveStep2', async (req, res) =>{
    var result ={};
    try{
        var {user_id, device_detail_id} = req.body;
        //check if auction_temp has that user_id
        var check = await buy.getAuctionTempWithUser(user_id);
        result = await buy.postStep2Update(user_id, device_detail_id, check);
        if(result.result !== define.const_SUCCESS)
            throw(isError.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 112/' + err);
        result.result = -112;
        return res.json(result);
    }
});

//step:3
router.get('/getStep3Info', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.query;
        result = await buy.getAuctionTempWithUserStep3(user_id);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 121/' + err);
        result.result = -121;
        return res.json(result);
    }
    
});

router.get('/getStep3PaymentInfo', async(req,res) =>{
    var result ={};
    try{
        var {agency, generation} = req.query;
        result = await buy.getStep3PaymentInfo(agency, generation);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 122/' + err);
        result.result = -122;
        return res.json(result);
    }
});

router.get('/getStep3OfficialInfo', async(req,res) =>{
    var result ={};
    try{
        var {device_detail_id, payment_id} = req.query;
        result = await buy.getSelectedPayment(device_detail_id, payment_id);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);                               
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 122/' + err);
        result.result = -122;
        return res.json(result);
    }
});

router.post('/postSaveStep3', async (req, res) =>{
    var result ={};
    try{
        var postInput = req.body;
        var check = await buy.getAuctionTempWithUserStep3(postInput.user_id);
        if(check.result != define.const_SUCCESS)
            throw(check.result);
        count = await buy.countAuctions(postInput.user_id);
        if(count.result != define.const_SUCCESS)
            throw(count.result);
        if(count.count >= 3){
            result.result = -1233
            throw(result.result)
        }
        //check returning device_id, state, device_detail_id
        //postInput has all the info of step 3
        result = await buy.postStep3Update(check, postInput);
        result.count = Number(count.count) + 1;
        if(result.result !== define.const_SUCCESS)
            throw(result.result);
        var kill = await buy.killAuctionTempState(postInput.user_id);
        if(kill.result != define.const_SUCCESS)
            throw(kill.result);
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 123/' + err);
        result.result = -123;
        return res.json(result);
    }
});

router.get('/finish', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.query;
        result = await buy.finishAuctionTempDeviceInfo(user_id);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 131/' + err);
        result.result = -131;
        return res.json(result);
    }
});

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
