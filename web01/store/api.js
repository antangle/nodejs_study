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
const {helper, comparePassword} = require('../../controller/validate');

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
        var {auction_id} = req.body;
        if(!auction_id){
            return res.json({result: 60211})
        }
        result = await store.get602Auction(auction_id);
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
        var {store_id, auction_id, discount_price} = req.body;
        if(!store_id || !auction_id || !discount_price){
            return res.json({result: 60221});
        }
        if(isNaN(discount_price)){
            return res.json({result: 60221});
        }
        //자릿수 10000원대만 나오게 sanitize
        discount_price = parseInt(discount_price/10000)*10000;
        
        var info = await store.get602NeededInfoForDeal(store_id, auction_id);
        if(info.result !== define.const_SUCCESS){
            result = {result: info.result}
            return res.json(result);
        }
        //최초입찰이 아닐때 조건 세팅
        if(info.data.now_discount_price !== 0){
        //최근 입찰자가 본인인지 확인
            if(info.data.now_order === info.data.deal_order){
                return res.json({result: 60222});
            }
        }
        if(!info.data.deal_id){
            //내 첫입찰
            var paramArray = [
                store_id, 
                auction_id, 
                discount_price, 
                info.store_nick
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
        }
        else if(info.data.deal_id){
            //내 갱신입찰
            result = await store.updateBefore602DealSend(info.data.deal_id, store_id);
            if(result.result !== define.const_SUCCESS){
                return res.json(result);
            }
            var paramArray = [
                store_id, 
                auction_id, 
                discount_price,
                info.store_nick
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
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s202 - DealSend/' + err);
        result.result = -60221;
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