const express = require('express');
const router = express.Router();

const path = require('path');
const version = require('../common/version').version;

router.use(express.json({limit: '50mb'}));
router.use(express.urlencoded({limit:'50mb', extended: false }));

const {helper} = require('../../controller/validate');
const functions = require('../../controller/function');
const define = require('../../definition/define');

const auction = require(path.join('../..', 'common' + version, 'query_myAuction'));
const buy = require(path.join('../..', 'common' + version, 'query_buy'));
const fcm_query = require(path.join('../..', 'common' + version, 'query_fcm'));
const myPage = require(path.join('../..', 'common' + version, 'query_myPage'));

const fcm_store = require('../../fcm/fcm_store');

router.get('/test', async(req, res)=>{
    try{
        var {device_id} = req.query;
        var result = {}
        var array = [];
        /*
            for(var device_id=1; device_id<54; ++device_id){
                result = await buy.test(device_id);
                if(!result.errDevice){
                    for(var i=0; i<result.rowCount; ++i){
                        if(result.rows[i].discount_official === null){
                            array.push(result.rows[i].device_id)
                            break;
                        }
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
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: getHomepageDevice/' + err);
        return res.json({result: -10001});
    }
});

router.post('/getStep1Latest', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.body;
        if(!user_id){
            return res.json({result: 10101});
        }
        var count = await buy.countAuctions(user_id);
        if(count.result !== define.const_SUCCESS){
            return res.json({result: -10108})
        }
        result = await buy.getAuctionTempWithUser(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        var latestDevices = await buy.getStep1Latest6();
        if(latestDevices.result !== define.const_SUCCESS){
            return res.json(latestDevices.result);
        }
        result.device_array = latestDevices.device_array;
        result.count = count.count;
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: getStep1Latest/' + err);
        return res.json({result: -10101});
    }
});

router.post('/getStep1WithBrand', async(req, res) => {
    var result ={};
    try{
        var {user_id, brand_id} = req.body;
        if(!user_id || !brand_id){
            return res.json({result: 10111});
        }
        result = await buy.getAuctionTempWithUser(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await buy.getStep1DeviceByBrand(brand_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: getStep1WithBrand/' + err);
        return res.json({result: -10111});
    }
});

router.post('/postSaveStep1', async(req, res) =>{
    var result ={};
    try{
        var {user_id, device_id} = req.body;
        if(!user_id || !device_id){
            return res.json({result: 10121});
        }
        var check = await buy.checkIsFirstAuction(user_id);
        if(check.result !== define.const_SUCCESS){
            return res.json(check);
        }
        var state = check.state;
        var temp_device_id = check.temp_device_id;
        if(state === define.const_DEAD || temp_device_id !== define.const_NULL){
            var result = await buy.postStep1Update(user_id, device_id);
            if(result.result != define.const_SUCCESS){
                return res.json({result: result.result});
            }
        }
        if (temp_device_id === define.const_NULL){
            var result = await buy.postStep1Insert(user_id, device_id);
            if(result.result != define.const_SUCCESS){
                return res.json({result: result.result});
            }
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: postSaveStep1/' + err);
        return res.json({result: -10121});
    }
});

//step:2
router.post('/getStep2ColorVolume', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.body;
        if(!user_id){
            return res.json({result: 10211});
        }
        result = await buy.getAuctionTempWithUser(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json({result: -10212});
        }
        var device_id = result.temp_device_id;

        var data = await buy.getStep2ColorVolume(device_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result.rowCount = data.rowCount;
        result.data = data.data;
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: getStep2ColorVolume/' + err);
        return res.json({result: -10211});
    }
});

router.post('/postSaveStep2', async (req, res) =>{
    var result ={};
    try{
        var {user_id, device_detail_id} = req.body;
        if(!user_id || !device_detail_id){
            return res.json({result: 10221});
        }
        //TODO: also have to check if device_detail_id matches device_id
        //check if auction_temp has that user_id
        var check = await buy.getAuctionTempWithUser(user_id);
        if(check.result !== define.const_SUCCESS){
            return res.json({result: -10222});
        }
        result = await buy.postStep2Update(user_id, device_detail_id, check);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: postSaveStep2/' + err);
        return res.json({result: -10221});
    }
});

//step:3
router.post('/getStep3Info', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.body;
        if(!user_id){
            return res.json({result: 10301})
        }
        result = await buy.getAuctionTempWithUserStep3(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: getStep3Info/' + err);
        return res.json({result: -10301});
    }
});

router.get('/getStep3PaymentInfo', async(req,res) =>{
    var result ={};
    try{
        var {agency, generation, device_detail_id} = req.query;
        if(!agency || !generation || !device_detail_id){
            return res.json({result: 10311});
        }
        result = await buy.getStep3PaymentInfo(agency, generation, device_detail_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: getStep3PaymentInfo/' + err);
        return res.json({result: -10311});
    }
});

router.get('/getStep3OfficialInfo', async(req,res) =>{
    var result ={};
    try{
        var {device_detail_id, payment_id} = req.query;
        if(!device_detail_id || !payment_id){
            return res.json({result: 10321})
        }
        result = await buy.getSelectedPayment(device_detail_id, payment_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: getStep3OfficialInfo/' + err);
        return res.json({result: -10321});
    }
});

router.post('/selectStep3AutobetMaxInfo', async(req,res) =>{
    var result ={};
    try{
        var {
            device_detail_id, 
            payment_id, 
            agency_use, 
            agency_hope
        } = req.body;
        if(
            functions.check_IsNumber(device_detail_id) === -1 ||
            functions.check_IsNumber(payment_id) === -1 ||
            functions.check_OneTwoThree(agency_use) === -1 ||
            functions.check_OneTwoThree(agency_hope) === -1
        ){
            return res.json({result: 10341});
        }
        var type = functions.check_type(agency_use, agency_hope);
    
        var condition = functions.generate_condition(
            agency_hope, type
        );

        result = await buy.selectAutobetMax(device_detail_id, condition, payment_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: selectStep3AutobetMaxInfo/' + err);
        return res.json({result: -10341});
    }
});

router.post('/countAuction', async (req, res) =>{
    var result ={};
    try{
        var {user_id} = req.body;
        result = await buy.countAuctions(user_id); 
        if(result.result !== define.const_SUCCESS){
            return res.json(result)
        }
        return res.json(result);
        }
    catch(err){
        console.log('router ERROR: countAuction/' + err);
        result.result = -10001;
        return res.json(result);
    }
});

router.post('/postSaveStep3', async (req, res) =>{
    var result ={};
    try{
        var postInput = req.body;
        /*
        postInput = {
            user_id, payment_id,
            agency_use, agency_hope, 
            period, contract_list,
            delivery
        }
        check = {
            device_detail_id, 
            temp_device_id
        }
        */
        //TODO: contract_list 에 대한 정규식 필요함
        if(!postInput.user_id || !postInput.payment_id ||
            !postInput.agency_use || !postInput.agency_hope || 
            !postInput.period || !postInput.contract_list ||
            !postInput.delivery ){
                return res.json({result: 10331});
            };
        //TODO: 쿼리 단순화/ 분기해야한다
        var type = functions.check_type(postInput.agency_use, postInput.agency_hope);
        var condition = functions.generate_condition(postInput.agency_hope, type);
        
        postInput.condition = condition;

        var check = await buy.getAuctionTempWithUserStep3(postInput.user_id);
        if(check.result !== define.const_SUCCESS){
            return res.json({result: -10332});
        }
        var count = await buy.countAuctions(postInput.user_id);
        if(count.result !== define.const_SUCCESS){
            return res.json({result: -10333});
        }
        if(count.count >= 3){
            return res.json({result: 10332});
        }
        //check returning device_id, state, device_detail_id
        //postInput has all the info of step 3
        result = await buy.postStep3Update(check, postInput);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        /* 그냥 step3Update 에 끼워넣음
        var kill = await buy.killAuctionTempState(postInput.user_id);
        if(kill.result !== define.const_SUCCESS){
            return res.json(kill);
        }
        */

        var auction_id = result.auction_id

        result = await buy.insert104AutoBetDealSend(auction_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await buy.update104AfterAutoBetDealSend(auction_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await buy.insert104PartyAfterAutobet(auction_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result.count = Number(count.count) + 1;
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: postSaveStep3/' + err);
        return res.json({result: -10331});
    }
});

router.post('/finish', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.body;
        if(!user_id){
            return res.json({result: 10411});
        }
        result = await buy.finishAuctionTempDeviceInfo(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: finish/' + err);
        result.result = -10411;
        return res.json(result);
    }
});

//현재 진행중인 auction
router.post('/get201MyAuctionOn', async (req, res) =>{
    var result ={};
    var {user_id} = req.body;
    if(!user_id){
        return res.json({result: 20111});
    }
    try{
        //user_id 받아서 관련 auction state 모두 update
        result = await auction.update201AuctionState(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await auction.get201AuctionInfo(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: get201MyAuctionOn/' + err);
        result.result = -20111;
        return res.json(result);
    }
});

router.post('/get201StateUpdate', async (req, res) =>{
    var result ={};
    var {auction_id} = req.body;
    try{
        //state, -1: unselected, 1: ongoing, 2: waiting selection
        result = await auction.post201StateUpdate(auction_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: get201StateUpdate/' + err);
        result.result = -20121;
        return res.json(result);
    }
});

router.post('/get202MyAuctionOff', async (req, res) =>{
    var result ={};
    try{
        var {user_id} = req.body;
        if(!user_id){
            return {result: 20211};
        }
        result = await auction.update202AuctionState(user_id);
        if(result.result !== define.const_SUCCESS){
            //코드 100차이만 나면 원하는 에러코드 부여 가능
            return res.json(result);
        }
        result = await auction.get202AuctionInfo(user_id)
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: get202MyAuctionOff/' + err);
        result.result = -20211;
        return res.json(result);
    }
});

router.post('/get203MyAuctionDetails', async (req, res) =>{
    var result ={};
    try{
        var {auction_id, user_id, now_order} = req.body;
        if(!now_order){
            now_order = 0;
        }
        if(!user_id || !auction_id){
            return {result: 20311};
        }
        result = await auction.post201StateUpdate(auction_id);
        if(result.result !== define.const_SUCCESS){
            return res.json({result: result.result - 190});
        }
        result = await auction.get203AuctionDeals(auction_id, user_id, now_order);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: get203MyAuctionDetails/' + err);
        result.result = -20311;
        return res.json(result);
    }
});

router.post('/get204MyAuctionDetailsFinish', async (req, res) =>{
    var result ={};
    try{
        var {auction_id, user_id} = req.body;
        if(!user_id || !auction_id){
            return {result: 20411};
        }
        result = await auction.post201StateUpdate(auction_id);
        if(result.result !== define.const_SUCCESS){
            return res.json({result: result.result - 290});
        }
        result = await auction.get204AuctionDealsFinish(auction_id, user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: get204MyAuctionDetailsFinish/' + err);
        result.result = -20411;
        return res.json(result);
    } 
});

router.post('/get205DealDetails', async (req, res) =>{
    var result ={};
    try{
        var {deal_id, user_id} = req.body;
        if(!deal_id || !user_id){
            return res.json({result: 20511});
        }
        result = await auction.get205DealDetail(deal_id, user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: get205DealDetails/' + err);
        result.result = -20511;
        return res.json(result);
    }
});

//update auction win_deal_id when the auction is confirmed.
router.patch('/patch208ConfirmPopup', async (req, res) =>{
    var result ={};
    try{
        var {deal_id, user_id} = req.body;
        if(!deal_id || !user_id){
            return res.json({result: 20811});
        }

        result = await auction.Update208DealConfirmation(deal_id, user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }

        result = await auction.Update208StorePointAfterConfirm(deal_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }

        result = await auction.Update208PointCheck(deal_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }

        //notification 해당 deal_id로 관련 partner push_token 모두 가져오기
        var fcm_response = await fcm_query.getStorePushTokensByDealId(deal_id);
        if(fcm_response.result === 90001){
            return res.json({result: define.const_SUCCESS});
        }
        else if(fcm_response.result !== define.const_SUCCESS){
            return res.json(fcm_response);
        }

        //해당 store한테 notification
        var message = await fcm_store.sendMessageToDeviceStore(fcm_response.push_token, define.payload_store, define.options_store);
        if(message === -1){
            return res.json({result: 20812});
        }
        if(message.failureCount > 0){
            return res.json({result: -20831});
        }
        
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: patch208ConfirmPopup/' + err);
        result.result = -20811;
        return res.json(result);
    }
});

router.post('/get209ConfirmedAuction', async (req, res) =>{
    var result ={};
    try{
        var {deal_id, user_id} = req.body;
        if(!deal_id || !user_id){
            return res.json({result: 20911})
        }
        result = await auction.get209ConfirmedAuction(deal_id, user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: get209ConfirmedAuction/' + err);
        result.result = -20911;
        return res.json(result);
    }
});

router.get('/get210InfoForReview', async (req, res) =>{
    var result ={};
    try{
        var {deal_id} = req.query;
        if(!deal_id){
            return res.json({result: 21011});
        }
        result = await auction.get210InfoForReview(deal_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: get210InfoForReview/' + err);
        result.result = -21011;
        return res.json(result);
    }
});

router.post('/post210DealReview', async(req,res) =>{
    var result ={};
    try{
        var {score, comment, deal_id, user_id} = req.body;
        if(!score || !comment || !deal_id || !user_id){
            return res.json({result: 21021});
        }
        else if(score > 5 || score < 0){
            return res.json({result: 21022});
        }
        score = Math.floor(10 * score);
        jsondata = {score, comment, deal_id, user_id};

        result = await auction.insert210Review(jsondata);
        if(result.result !== define.const_SUCCESS){
            return res.json(result)
        }
        jsondata.scoreGap = result.scoreGap;

        if(result.isScoreNull == true){
            //isScoreNull true -> the review is new
            jsondata.weight = 1;
            //scoreGap, weight, deal_id is in jsondata
            result = await auction.update210StoreAfterReview(jsondata);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
        }
        else{
            jsondata.weight = 0;
            var result = await auction.update210StoreAfterReview(jsondata);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: post210DealReview/' + err);
        result.result = -21021;
        return res.json(result);
    }
});

router.get('/get211StoreDetails', async(req,res) =>{
    var result ={};
    try{
        var {deal_id} = req.query;
        if(!deal_id){
            return res.json({result: 21111});
        }
        result = await auction.get211StoreDetails(deal_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: get211StoreDetails/' + err);
        result.result = -21111;
        return res.json(result);
    }
});

router.get('/get212AllStoreReviews', async(req,res) =>{
    var result ={};
    try{
        var {deal_id} = req.query;
        if(!deal_id){
            return res.json({result: 21211});
        }
        result = await auction.get212AllStoreReviews(deal_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: get212AllStoreReviews/' + err);
        result.result = -21211;
        return res.json(result);
    }
});

router.post('/213InfoForReport', async(req,res) =>{
    var result ={};
    try{
        var {deal_id} = req.body;
        if(!deal_id){
            return res.json({result: 21311});
        }
        result = await auction.get213InfoForReport(deal_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 213InfoForReport/' + err);
        result.result = -21311;
        return res.json(result);
    }
});

router.post('/post213Report', async(req,res) =>{
    var result ={};
    try{
        var {deal_id, type, comment} = req.body;
        if(!deal_id || !type || !comment){
            return res.json({result: 2131});
        }
        result = await auction.post213Report(deal_id, type, comment);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: post213Report/' + err);
        result.result = -2131;
        return res.json(result);
    }
});

/* mypage */
router.post('/myPageNeededInfo401', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.body;
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

        //notification
        var fcm_response = await fcm_query.getAdminPushTokenStore();
        if(fcm_response.result !== define.const_SUCCESS){
            return res.json(fcm_response);
        }
        var push_token = fcm_response.push_token;
        
        //Admin 에게 문의내용 올라올시 push
        var message = await fcm_store.sendMessageToDeviceStore(push_token, define.payload_admin_user, define.option_admin_user);
        if(message === -1){
            return res.json({result: 4022});
        }
        if(message.failureCount > 0){
            return res.json({result: -40211});
        }

        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: myPageHelp402/' + err);
        result.result = -4021;
        return res.json(result);
    }
});

router.post('/myReview403', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.body;
        if(!user_id){
            return res.json({result: 4031});
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
        return res.json({result: 40401});
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
        result.result = -40401;
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

router.post('/locationInfo405', async (req, res) =>{
    var result ={};    
    var {user_id} = req.body;
    try{
        if(!user_id){
            return res.json({result: 40501});
        }
        result = await myPage.changeLocationInfo(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: postlocation405/' + err);
        result.result = -40501;
        return res.json(result);
    }
});

router.get('/GetSdCode405', async (req, res) =>{
    var result ={};
    try{     
        result = await myPage.get007SdCode();
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: GetSdCode405/' + err);
        result.result = -40511;
        return res.json(result);
    }
});

router.get('/GetSggCode405', async (req, res) =>{
    var result ={};
    var {sido_code} = req.query;
    try{
        if(!sido_code){
            return res.json({result: 40521});
        }
        else if(sido_code <100 || sido_code > 1700){
            return res.json({result: 40521});
        }
        result = await myPage.get007SggCode(sido_code);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: GetSggCode405/' + err);
        result.result = -40521;
        return res.json(result);
    }
});

router.post('/changeLocation405', async (req, res) =>{
    var result ={};
    var {user_id, sido_code, sgg_code} = req.body;
    try{
        if(!sido_code || !sgg_code || !user_id){
            return res.json({result: 40531});
        }
        result = await myPage.post007LocationCode(sido_code, sgg_code, user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 405 - changeLocation405/' + err);
        result.result = -40531;
        return res.json(result);
    }
});

router.post('/changePassword406', async(req,res) =>{
    var result ={};
    var {user_id} = req.body;
    //old_pwd: 과거 비번, new_pwd: 바뀌는 비번
    try{
        if(!user_id || !req.body.old_pwd || !req.body.new_pwd){
            //input 존재하지 않음
            return res.json({result: 40601})
        }
        if(!helper.isValidPassword(req.body.new_pwd)){
            return res.json({result: 40602})
        }
        const pwd = await myPage.getUserPassword406(user_id);
        if(pwd.result !== define.const_SUCCESS){
            //getUserPassword405에서 뭔가 실패
            return res.json({result: pwd.result});
        }
        if(!helper.comparePassword(req.body.old_pwd, pwd.hash_pwd)){
            //예전 비번이 다름
            return res.json({result: 40603});
        }
        const hash_pwd = helper.hashPassword(req.body.new_pwd);
        //비밀번호 변수 지워놓기
        delete req.body.new_pwd;
        delete req.body.old_pwd;

        result = await myPage.changeUserPassword406(user_id, hash_pwd);
        if(result.result !== define.const_SUCCESS){
            return res.json({result: result.result});
        }
        return res.json(result);
    }
    catch(err){       
        delete req.body.old_pwd;
        delete req.body.new_pwd;
        console.log('router ERROR: changePassword406/' + err);
        result.result = -40601;
        return res.json(result);
    }
});

router.post('/UserShutAccount410', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.body;
        if(!user_id){
            return res.json({result: 4101});
        }
        result = await myPage.UserShutAccount410(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: UserShutAccount410/' + err);
        result.result = -4101;
        return res.json(result);
    }
});

module.exports = router;