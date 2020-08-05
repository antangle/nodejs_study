const express = require('express');
const router = express.Router();

router.use(express.json({limit: '50mb'}));
router.use(express.urlencoded({limit:'50mb', extended: false }));

const {helper} = require('../../controller/validate');
const buy = require('../common/query_buy');
const auction = require('../common/query_myAuction');
const myPage = require('../common/query_myPage');
const define = require('../../definition/define')

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
        console.log(array);
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
            return res.json(result)
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
            period, contract_list
        }
        check = {
            device_detail_id, 
            temp_device_id
        }
        */
        //TODO: contract_list 에 대한 정규식 필요함
        if(!postInput.user_id || !postInput.payment_id ||
            !postInput.agency_use || !postInput.agency_hope || 
            !postInput.period || !postInput.contract_list){
                return res.json({result: 10331});
            };
        //TODO: 쿼리 단순화/ 분기해야한다
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
        result.count = Number(count.count) + 1;
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        /* 그냥 step3Update 에 끼워넣음
        var kill = await buy.killAuctionTempState(postInput.user_id);
        if(kill.result !== define.const_SUCCESS){
            return res.json(kill);
        }
        */
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
            return res.json({result: 10411})
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
    var array =[];
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
        result.selected_device_data = array;
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 201/' + err);
        result.result = -20111;
        return res.json(result);
    }
});

router.post('/get201StateUpdate', async (req, res) =>{
    var result ={};
    var {auction_id} = req.body;
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
            result = {result: -20312}
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
        if(result.result !== define.const_SUCCESS){
            return res.json(result)
        }
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
        if(result.result !== define.const_SUCCESS){
            return res.json(result)
        }
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
        if(result.result !== define.const_SUCCESS){
            return res.json(result)
        }
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
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        var data = await auction.getDeviceInfoWithDetail_Id(result.deal[0].device_detail_id);
        if(data.result !== define.const_SUCCESS){
            return res.json(result);
        }
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
        if(result.result !== define.const_SUCCESS){
            return res.json(result)
        }
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
        if(result.result !== define.const_SUCCESS){
            return res.json(result)
        }
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
        if(result.result !== define.const_SUCCESS){
            return res.json(result)
        }
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
        if(result.result !== define.const_SUCCESS){
            return res.json(result)
        }
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
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
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
        result = await auction.get212AllStoreReviews(store_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: 211/' + err);
        result.result = -211;
        return res.json(result);
    }
});

/* mypage */
router.get('/myPageNeededInfo401', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.query;
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
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: myPageHelp402/' + err);
        result.result = -4021;
        return res.json(result);
    }
});

router.get('/myReview403', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.query;
        if(!user_id){
            return res.json({result: 4032});
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
        return res.json({result: -40401});
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
        result.result = -4040;
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

router.post('/changePlace405', async(req,res) =>{
    var result ={};
    var {user_id, sido_code, sgg_code} = req.body;
    if(!sido_code || !sgg_code || !user_id || sido_code <100|| sgg_code < 100){
        return res.json({result: 40511});
    }
    try{
        result = await myPage.post007LocationCode(sido_code, sgg_code, user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: changePlace405/' + err);
        result.result = -4050;
        return res.json(result);
    }
});

router.post('/changePassword406', async(req,res) =>{
    var result ={};
    var {user_id} = req.body;
    //old_pwd: 과거 비번, new_pwd: 바뀌는 비번
    if(!user_id || !req.body.old_pwd || !req.body.new_pwd){
        //input 존재하지 않음
        return res.json({result: 40601})
    }
    if(!helper.isValidPassword(req.body.new_pwd)){
        return res.json({result: -40605})
    }
    try{
        const pwd = await myPage.getUserPassword406(user_id);
        if(pwd.result !== define.const_SUCCESS){
            //getUserPassword405에서 뭔가 실패
            return res.json({result: pwd.result});
        }
        if(!helper.comparePassword(req.body.old_pwd, pwd.hash_pwd)){
            //비번이 다름
            return res.json({result: 40602});
        }
        const hash_pwd = helper.hashPassword(req.body.new_pwd);
        delete req.body.login_pwd;

        result = await myPage.changeUserPassword406(user_id, hash_pwd);
        if(result.result !== define.const_SUCCESS){
            return res.json({result: result.result});
        }
        return res.json(result);
    }
    catch(err){
        delete req.body.login_pwd;
        console.log('router ERROR: changePassword406/' + err);
        result.result = -4060;
        return res.json(result);
    }
});

router.post('/UserShutAccount410', async(req,res) =>{
    var result ={};
    try{
        var {user_id} = req.body;
        if(!user_id){
            return res.json({result: -4102});
        }
        result = await myPage.UserShutAccount410(user_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: getOut410/' + err);
        result.result = -4101;
        return res.json(result);
    }
});

module.exports = router;