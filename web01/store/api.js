const express = require('express');
const router = express.Router();

router.use(express.json({limit: '50mb'}));
router.use(express.urlencoded({limit:'50mb', extended: false }));

const path = require('path')
const dotenv = require('dotenv');
dotenv.config({path: path.join(__dirname, '/../../.env')});

const define = require('../../definition/define')
const store = require('../common/query_storeAuction')
const myPage = require('../common/query_myPage');
const functions = require('../../controller/function');
const {helper, comparePassword} = require('../../controller/validate');
const { kStringMaxLength } = require('buffer');
const { stringify } = require('querystring');
const { Console } = require('console');

router.post('/S101HomepageInfo', async (req, res) =>{
    var result ={};
    try{
        var {store_id} = req.body;
        if(!store_id){
            return res.json({result: 50111})
        }
        var myDeal = await store.get501StoreAuction(store_id);
        var lookaround = await store.get501Search(store_id);
        var review = await store.get501Reviews(store_id);
        result = {
            myDeal: myDeal.myDeal, 
            auction: lookaround.auction, 
            review: review.review
        };
        if(myDeal.result !== define.const_SUCCESS){
            result.result = myDeal.result;
            return res.json(result);
        }
        else if(lookaround.result !== define.const_SUCCESS){
            result.result = lookaround.result;
            return res.json(result);
        }
        else if(review.result !== define.const_SUCCESS){
            result.result = review.result;
            return res.json(result);
        }
        result.result = define.const_SUCCESS;
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s101 - S101HomepageInfo/' + err);
        result.result = -50111;
        return res.json(result);
    }
});

router.post('/S201SearchAuction', async (req, res) =>{
    var result ={};
    try{
        var {store_id} = req.body;
        if(!store_id){
            return res.json({result: 60111})
        }
        result = await store.get601Search(store_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S201SearchAuction/' + err);
        result.result = -60111;
        return res.json(result);
    }
});

router.post('/S201CutAuction', async (req, res) =>{
    var result ={};
    try{
        var {store_id, auction_id} = req.body;
        if(!store_id || !auction_id){
            return res.json({result: 60121});
        }
        result = await store.post601CutInsert(store_id, auction_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await store.post601CutAuctionUpdate(auction_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S201CutAuction/' + err);
        result.result = -60121;
        return res.json(result);
    }
});

router.delete('/S201DeleteCut', async (req, res) =>{
    var result ={};
    try{
        var {pwd} = req.body;
        if(!pwd){
            return res.json({result: 60131});
        }
        if(pwd !== process.env.CUTDELETEPWD){
            return res.json({result: 60131});
        }
        result = await store.delete601CutAuction();
        if(result.result !== define.const_SUCCESS){
            res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S201DeleteCut/' + err);
        result.result = -60131;
        return res.json(result);
    }
});

router.post('/S202AuctionInfo', async (req, res) =>{
    var result ={};
    try{
        var {auction_id, store_id} = req.body;
        if(!auction_id || !store_id){
            return res.json({result: 60211});
        }
        result = await store.get602Auction(auction_id, store_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S202AuctionInfo/' + err);
        result.result = -60211;
        return res.json(result);
    }
});

router.post('/S202AuctionDealSend', async (req,res) =>{
    var result ={};
    try{
        var {store_id, auction_id, discount_price, cancel, comment} = req.body;
        if(!store_id || !auction_id || !discount_price){
            return res.json({result: 60221});
        }
        
        var curr_deal_id;

        if(!comment){
            comment = null;
        }
        discount_price = functions.check_DiscountPrice(discount_price);
        if(discount_price === -1){
            return res.json({result: 60221});
        }
        if(cancel != 1){
            cancel = -1; 
        }
        else{
            cancel = 1;
        }
        
        var info = await store.get602NeededInfoForDeal(store_id, auction_id);
        if(info.result !== define.const_SUCCESS){
            result = {result: info.result}
            return res.json(result);
        }
        if(!info.data.deal_id){
            //내 첫입찰
            var paramArray = [
                store_id, 
                auction_id, 
                discount_price, 
                info.store_nick,
                comment
            ];
            store_count = 1;

            result = await store.insert602DealSend(paramArray);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
            curr_deal_id = result.deal_id

            result = await store.updateAfter602DealSendInsert(auction_id, discount_price, store_count);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
            result = await store.insert602Party(store_id, auction_id);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
        }
        else if(info.data.deal_id){
            //내 갱신입찰
            result = await store.updateBefore602DealSend(info.data.deal_id, store_id, cancel);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
            var paramArray = [
                store_id,
                auction_id,
                discount_price,
                info.store_nick,
                comment
            ];
            store_count = 1;

            result = await store.insert602DealSend(paramArray);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
            curr_deal_id = result.deal_id

            result = await store.updateAfter602DealSendInsert(auction_id, discount_price, store_count, cancel);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s202 - DealSend/' + err);
        result.result = -60221;
        return res.json(result);
    }
});

router.delete('/HandlerDelete', async (req, res) =>{
    var result ={};
    try{
        var {pwd} = req.body;

        if(!pwd){
            return res.json({result: 60311});
        }
        if(pwd !== process.env.CUTDELETEPWD){
            return res.json({result: 60311});
        }
        result = await store.delete601CutAuction();
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await store.deleteParty();
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await store.delete701CutDeal();
        if(result.result !== define.const_SUCCESS){
            res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: HandlerDelete/' + err);
        result.result = -60311;
        return res.json(result);
    }
});

router.post('/S204SelectDeliveryDefault', async (req, res) =>{
    var result ={};
    try{
        var {store_id} = req.body;
        
        store_id = functions.check_StringID(store_id);

        if(store_id === -1){
            return res.json({result: 60501});
        }

        result = await store.selectS204Delivery(store_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }

        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S204UpdateDeliveryDefault/' + err);
        result.result = -60501;
        return res.json(result);
    }
});

router.post('/S204UpdateDeliveryDefault', async (req, res) =>{
    var result ={};
    try{
        var {store_id, delivery} = req.body;
        
        store_id = functions.check_StringID(store_id);

        if(
            store_id === -1 ||
            functions.check_OneTwo(delivery) === -1){
            return res.json({result: 60401});
        }

        result = await store.updateS204StoreDelivery(store_id, delivery);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await store.updateS204AutobetDelivery(store_id, delivery);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }

        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S204UpdateDeliveryDefault/' + err);
        result.result = -60401;
        return res.json(result);
    }
});

router.post('/S204AutoBetSet', async (req, res) =>{
    var result ={};
    try{
        var {store_id, agency, brand_id} = req.body;
        
        store_id = functions.check_StringID(store_id);

        if(
            store_id === -1 ||
            functions.check_IsNumber(agency) === -1 ||
            functions.check_IsNumber(brand_id) === -1){
            return res.json({result: 60511});
        }
        result = await store.selectS204AutoBetUnset(store_id, agency, brand_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        var unsetCount = result.unsetCount
        result = await store.selectS204AutoBetSet(store_id, agency, brand_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result.unsetCount = unsetCount;
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S204AutoBetSet/' + err);
        result.result = -60511;
        return res.json(result);
    }
});

router.post('/S204AutoBetUnset', async (req, res) =>{
    var result ={};
    try{
        var {store_id, agency, brand_id} = req.body;
    
        if(
            store_id === -1 ||
            functions.check_IsNumber(agency) === -1 ||
            functions.check_IsNumber(brand_id) === -1){
            return res.json({result: 60421});
        }

        result = await store.selectS204AutoBetUnset(store_id, agency, brand_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S204AutoBetHomeInfo/' + err);
        result.result = -60421;
        return res.json(result);
    }
});

router.post('/S204AutoBetCancel', async (req, res) =>{
    var result ={};
    try{
        var {store_id, autobet_max_id, state} = req.body;

        store_id = functions.check_StringID(store_id);
        state = functions.check_State(state);

        if(
            store_id === -1 || state === -2 ||
            functions.check_IsNumber(autobet_max_id) === -1
        ){
            return res.json({result: 60431});
        }
        //autobet 테이블의 state 업데이트
        result = await store.updateS204AutoBetState(store_id, autobet_max_id, state);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        
        if(state === 1){
            //activate 시, autobet_max 업데이트
            result = await store.updateS204AutoBetMaxActivate(store_id, autobet_max_id);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
            //activate 시, 해당 자동입찰 관한 deal insert
            result = await store.insertS204AutoBetDealSend(store_id, autobet_max_id);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
            //activate 시, 해당 입찰된 deal에 관련된 auction update
            result = await store.updateS204AfterAutoBetDealSend(store_id, autobet_max_id);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
            //activate 시, 해당 자동입찰 deal 관한 party insert
            result = await store.insertS204PartyAfterAutobet(store_id, autobet_max_id);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
        }
        else if(state === -1){
            //inactivate 시 autobet_max 관련 업데이트
            result = await store.updateS204AutoBetMaxInactivate(autobet_max_id);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
        }

        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S204AutoBetHomeInfo/' + err);
        result.result = -60431;
        return res.json(result);
    }
});

router.post('/S204AutoBetUpsert', async (req, res) =>{
    var result ={};
    try{
        var {
            store_id,
            main_payment_id,
            autobet_max_id,
            discount_price,
        } = req.body;
        //agency는 1,2,3 나머지 type 1,2

        store_id = functions.check_StringID(store_id);
        
        if(
            store_id === -1 ||
            functions.check_IsNumber(main_payment_id) === -1 ||
            functions.check_IsNumber(discount_price) === -1 ||
            functions.check_IsNumber(autobet_max_id) === -1
        ){
            return res.json({result: 60441});
        }
        
        /*
            store_id, device_volume_id, 
            main_payment_id, condition,
            autobet_max_id, device_id, 
            discount_price, agency, 
            change_type, state
        */

        var paramArray = [
            store_id, autobet_max_id,
            main_payment_id, discount_price,
        ];

        result = await store.upsertS204AutoBet(paramArray);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        
        result = await store.updateS204BeforeAutoBetDealSend(store_id, autobet_max_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await store.updateS204AutoBetCurrentMax(store_id, discount_price, autobet_max_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await store.insertS204AutoBetDealSend(store_id, autobet_max_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await store.updateS204AfterAutoBetDealSend(store_id, autobet_max_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await store.insertS204PartyAfterAutobet(store_id, autobet_max_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S205AutoBetSet/' + err);
        result.result = -60441;
        return res.json(result);
    }
});

router.post('/S301MyOngoingDeal', async (req, res) =>{
    var result ={};
    try{
        var {store_id} = req.body;
        if(!store_id){
            return res.json({result: 7011})
        }
        result = await store.get701MyOngoingDeal(store_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s301 - MyOngoingDeal/' + err);
        result.result = -7011;
        return res.json(result);
    }
});


router.post('/S301CutDeal', async (req, res) =>{
    var result ={};
    try{
        var {store_id, deal_id} = req.body;
        if(!store_id || !deal_id){
            return res.json({result: 70111});
        }
        result = await store.post701CutDealInsert(store_id, deal_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S301CutDeal/' + err);
        result.result = -70111;
        return res.json(result);
    }
});

router.delete('/S301DeleteCutDeal', async (req, res) =>{
    var result ={};
    try{
        var {pwd} = req.body;
        if(!pwd){
            return res.json({result: 70121});
        }
        if(pwd !== process.env.CUTDELETEPWD){
            return res.json({result: 70121});
        }
        result = await store.delete701CutDeal();
        if(result.result !== define.const_SUCCESS){
            res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S301DeleteCutDeal/' + err);
        result.result = -70121;
        return res.json(result);
    }
});

router.post('/S302MyPreviousDeal', async (req, res) =>{
    var result ={};
    try{
        var {store_id} = req.body;
        if(!store_id){
            return res.json({result: 7021})
        }
        result = await store.get702MyPreviousDeal(store_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s302 - MyPreviousDeal/' + err);
        result.result = -7021;
        return res.json(result);
    }
});

router.post('/S303MyDealDetail', async (req, res) =>{
    var result ={};
    try{
        var {deal_id, store_id} = req.body;
        if(!store_id || !deal_id){
            return res.json({result: 7031})
        }
        result = await store.get703MyDealDetail(deal_id, store_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s302 - MyPreviousDeal/' + err);
        result.result = -7031;
        return res.json(result);
    }
});

// store myPage

router.post('/myPageNeededInfoS401', async(req,res) =>{
    var result ={};
    try{
        var {partner_id} = req.body;
        if(!partner_id){
            return res.json({result: 8011});
        }
        result = await myPage.myPageNeededInfo801(partner_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result)
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: myPageNeededInfo801/' + err);
        result.result = -8011;
        return res.json(result);
    }
});

router.post('/myPageHelpS402', async(req,res) =>{
    var result ={};
    try{
        var {partner_id, type, comment} = req.body;
        if(!partner_id || !type ||!comment){
            return res.json({result: 8021});
        }
        result = await myPage.myPageHelp802(partner_id, type, comment);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: myPageHelp802/' + err);
        result.result = -8021;
        return res.json(result);
    }
});

router.post('/myReviewS403', async(req,res) =>{
    var result ={};
    try{
        var {partner_id} = req.body;
        if(!partner_id){
            return res.json({result: 8031});
        }
        result = await myPage.myReview803(partner_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: myReview803/' + err);
        result.result = -8031;
        return res.json(result);
    }
});

router.post('/changePasswordS404', async(req,res) =>{
    var result ={};
    var {partner_id} = req.body;
    //old_pwd: 과거 비번, new_pwd: 바뀌는 비번
    if(!partner_id || !req.body.old_pwd || !req.body.new_pwd){
        //input 존재하지 않음
        return res.json({result: 80401});
    }
    if(!helper.isValidPassword(req.body.new_pwd)){
        return res.json({result: 80402});
    }
    try{
        const pwd = await myPage.getPartnerPassword804(partner_id);
        if(pwd.result !== define.const_SUCCESS){
            //getPartnerPassword804에서 뭔가 실패
            return res.json({result: pwd.result});
        }
        if(!helper.comparePassword(req.body.old_pwd, pwd.hash_pwd)){
            return res.json({result: 80403});
        }
        const hash = helper.hashPassword(req.body.new_pwd);
        delete req.body.new_pwd;

        result = await myPage.changePartnerPassword804(partner_id, hash);
        if(result.result !== define.const_SUCCESS){
            return res.json({result: result.result});
        }
        return res.json(result);
    }
    catch(err){
        delete req.body.new_pwd;
        console.log('router ERROR: changePassword804/' + err);
        result.result = -80401;
        return res.json(result);
    }
});

router.post('/partnerShutAccountS410', async(req,res) =>{
    var result ={};
    try{
        var {partner_id} = req.body;
        if(!partner_id){
            return res.json({result: 8101});
        }
        result = await myPage.partnerShutAccount810(partner_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: partnerShutAccount810/' + err);
        result.result = -8101;
        return res.json(result);
    }
});

module.exports = router;