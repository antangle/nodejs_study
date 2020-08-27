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

router.post('/S204AutoBetHomeInfo', async (req, res) =>{
    var result ={};
    try{
        var {store_id} = req.body;
        if(!store_id){
            return res.json({result: 60411});
        }
        result = await store.selectS204AutoBetInfo(store_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S204AutoBetHomeInfo/' + err);
        result.result = -60411;
        return res.json(result);
    }
});

router.post('/S204AutoBetCancelAll', async (req, res) =>{
    var result ={};
    try{
        var {store_id, cancel} = req.body;
        if(!store_id || !cancel){
            return res.json({result: 60421});
        }
        if(cancel != 1 && cancel != -1){
            return res.json({result: 60421});
        }
        cancel = functions.check_State(cancel);

        result = await store.updateS204AutoBetCancelAll(store_id, cancel);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S204AutoBetCancelAll/' + err);
        result.result = -60411;
        return res.json(result); 

    }
});

router.get('/S204AutoBetDevice', async (req, res) =>{
    var result ={};
    try{
        var {brand_id} = req.query;
        if(functions.check_IsNumber(brand_id) === -1){
            brand_id = 1;
            //default: SKT
        }
        
        var latest = await store.selectS204AutoBetDeviceLatest();
        if(latest.result !== define.const_SUCCESS){
            return res.json(latest);
        }

        result = await store.selectS204AutoBetDeviceByBrand(brand_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result.latest = latest.info;
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S204AutoBetHomeInfo/' + err);
        result.result = -60431;
        return res.json(result);
    }
});

router.get('/S204AutoBetDeviceVolume', async (req, res) =>{
    var result ={};
    try{
        var {device_id} = req.query;
        console.log(device_id);
        console.log(typeof(device_id));
        if(functions.check_IsNumber(device_id) === -1){
            return res.json({result: 60441});
        }

        result = await store.selectS204AutoBetDeviceVolume(device_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S204AutoBetHomeInfo/' + err);
        result.result = -60441;
        return res.json(result);
    }
});

router.post('/S205AutoBetInfoBefore', async (req, res) =>{
    var result ={};
    try{
        var {store_id, device_id} = req.body;
        if(!store_id || !device_id){
            return res.json({result: 60511});
        }
        result = await store.selectS205AutoBetInfoBefore(store_id, device_id);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S205AutoBetInfoBefore/' + err);
        result.result = -60511;
        return res.json(result);
    }
});

router.post('/S205AutoBetInfoAfter', async (req, res) =>{
    var result ={};
    try{
        var {
            store_id,
            device_id,
            volume,
            agency,
            change_type,
            plan,
            delivery
        } = req.body;
        if(!store_id || !device_id || !volume || !agency || 
            !change_type || !plan || !delivery){
            return res.json({result: 60521});
        }
        if(
            functions.check_OneTwo(change_type) === -1 ||
            functions.check_OneTwo(plan) === -1 ||
            functions.check_OneTwo(delivery) === -1 ||
            functions.check_IsNumber(agency) === -1 ||
            functions.check_IsNumber(device_id) === -1 ||
            functions.check_IsNumber(volume) === -1
        ){
            return res.json({result: 60521});
        }
        var device_volume_id = functions.generate_dvi(device_id, volume);
        var condition = functions.generate_condition(
            agency,
            change_type,
            plan,
            delivery
        );
        
        //활성화된 조건들 보기
        var check_condition = await store.selectS205AutoBetCondition(device_volume_id, store_id);
        if(check_condition.result !== define.const_SUCCESS){
            return res.json(check_condition);
        }

        //해당 condition의 요금제, 현재 자동입찰 최고가 보기
        result = await store.selectS205AutoBetInfoAfter(device_volume_id, condition);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result.condition = check_condition.info
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S205AutoBetInfo/' + err);
        result.result = -60521;
        return res.json(result);
    }
});

router.post('/S205AutoBetSet', async (req, res) =>{
    var result ={};
    try{
        var {
            store_id,
            device_id,
            volume,
            agency,
            change_type,
            plan,
            delivery,
            payment_jsonArray,
            state
        } = req.body;
        //agency는 1,2,3 나머지 type 들은 1,2
        if(!store_id || !device_id || !volume || !agency || !change_type ||
            !plan || !delivery || !payment_jsonArray || !state){
            return res.json({result: 60531});
        }

        if(
            functions.check_OneTwo(change_type) === -1 ||
            functions.check_OneTwo(plan) === -1 ||
            functions.check_OneTwo(delivery) === -1 ||
            functions.check_IsNumber(agency) === -1 ||
            functions.check_IsNumber(device_id) === -1 ||
            functions.check_IsNumber(volume) === -1
        ){
            return res.json({result: 60531});
        }

        state = functions.check_State(state);
        var device_volume_id = functions.generate_dvi(device_id, volume);
        
        var paramArray = [];
        for(var i=0; i<payment_jsonArray.length; ++i){
            var payment_id = functions.check_IsNumber(payment_jsonArray[i].payment_id);
            if(payment_id === -1){
                return res.json({result: 60531});
            }
            
            var discount_price = functions.check_DiscountPrice(payment_jsonArray[i].discount_price);
            if(discount_price === -1){
                return res.json({result: 60531});
            }

            var is_payment_main = functions.check_IsNumber(payment_jsonArray[i].is_payment_main);
            //unique 조건 4개를 하나로 합치기 위해 condition 생성
            var condition = functions.generate_condition(
                agency, 
                change_type, 
                plan, 
                delivery
            );
            paramArray.push([
                store_id,
                device_volume_id,
                payment_id,
                condition,
                agency,
                change_type,
                plan,
                delivery,
                discount_price,
                state,
                is_payment_main,
                device_id
            ]);
        }
        result = await store.upsertS205AutoBet(paramArray);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await store.updateS205BeforeAutoBetDealSend();
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await store.insertS205AutoBetDealSend();
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await store.updateS205AfterAutoBetDealSend();
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        result = await store.insertS205PartyAfterAutobet();
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: S205AutoBetSet/' + err);
        result.result = -60531;
        return res.json(result);
    }
});

router.post('/S205AutoBetLoad', async (req, res) =>{
    var result ={};
    try{
        var {
            store_id,
            device_id,
            volume,
            agency,
            change_type,
            plan,
            delivery,
            step,
            autobet_name
        } = req.body;
        if(!store_id || !device_id || !volume || !agency || !change_type ||
            !plan || !delivery || !step){
            return res.json({result: 60551});
        }
        if(
            functions.check_OneTwo(change_type) === -1 ||
            functions.check_OneTwo(plan) === -1 ||
            functions.check_OneTwo(delivery) === -1 ||
            functions.check_IsNumber(agency) === -1 ||
            functions.check_IsNumber(device_id) === -1 ||
            functions.check_IsNumber(volume) === -1 ||
            functions.check_OneTwo(step) === -1
        ){
            return res.json({result: 60551});
        }

        var device_volume_id = functions.generate_dvi(device_id, volume);
        var condition = functions.generate_condition(
                            agency, 
                            change_type, 
                            plan, 
                            delivery
                        );
        if(step === 1){
            result = await store.selectS205AutoBetInfoLoad(store_id, device_volume_id, condition, device_id);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
        }
        if(step === 2){
            if(!autobet_name){
                return res.json({result: 60551});
            }
            result = await store.selectS205AutoBetInfoLoad2(store_id, device_volume_id, condition, autobet_name);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s301 - MyOngoingDeal/' + err);
        result.result = -60551;
        return res.json(result);
    }
});

router.post('/S205AutoBetCancel', async (req, res) =>{
    var result ={};
    try{
        var {
            store_id,
            device_id,
            volume,
            agency,
            change_type,
            plan,
            delivery,
            cancel
        } = req.body;
        if(!store_id || !device_id || !volume || !agency || !change_type ||
            !plan || !delivery || !cancel){
            return res.json({result: 60561});
        }
        if(
            functions.check_OneTwo(change_type) === -1 ||
            functions.check_OneTwo(plan) === -1 ||
            functions.check_OneTwo(delivery) === -1 ||
            functions.check_IsNumber(agency) === -1 ||
            functions.check_IsNumber(device_id) === -1 ||
            functions.check_IsNumber(volume) === -1
        ){
            return res.json({result: 60561});
        }
        if(cancel != 1 && cancel != -1){
            return res.json({result: 60561});
        }
        cancel = functions.check_State(cancel);

        var device_volume_id = functions.generate_dvi(device_id, volume);
        var condition = functions.generate_condition(
                            agency, 
                            change_type, 
                            plan, 
                            delivery
                        );
        
        result = await store.updateS205AutoBetCancel(store_id, device_volume_id, condition, cancel);
        if(result.result !== define.const_SUCCESS){
            return res.json(result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s301 - MyOngoingDeal/' + err);
        result.result = -60561;
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