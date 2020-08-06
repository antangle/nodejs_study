const express = require('express');
const router = express.Router();

router.use(express.json({limit: '50mb'}));
router.use(express.urlencoded({limit:'50mb', extended: false }));

const define = require('../../definition/define')
const store = require('../common/query_storeAuction')
const myPage = require('../common/query_myPage');
const {helper, comparePassword} = require('../../controller/validate');

router.post('/S101HomepageInfo', async (req, res) =>{
    var result ={};
    try{
        var {store_id} = req.body;
        var myDeal = await store.get501StoreAuction(store_id);
        if(myDeal.result !== define.const_SUCCESS){
            return res.json(myDeal);
        }
        var lookaround = await store.get501Search(store_id);
        if(lookaround.result !== define.const_SUCCESS){
            return res.json(lookaround);
        }
        var review = await store.get501Reviews(store_id);
        if(review.result !== define.const_SUCCESS){
            return res.json(review);
        }
        result = {
            myDeal: myDeal.myDeal, 
            auction: lookaround.auction, 
            review: review.review, 
            result: define.const_SUCCESS
        };
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s101 - GetHomepageInfo/' + err);
        result.result = -50111;
        return res.json(result);
    }
});

router.get('/S201SearchAuction', async (req, res) =>{
    var result ={};
    try{
        var {store_id} = req.query;
        result = await store.get701Search(store_id);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s201 - GetInfo/' + err);
        result.result = -701;
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
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s201 - Cut/' + err);
        result.result = -702;
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
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s201 - Delete/' + err);
        result.result = -703;
        return res.json(result);
    }
});

router.get('/S202AuctionInfo', async (req, res) =>{
    var result ={};
    try{
        var {auction_id} = req.query;
        result = await store.get702Auction(auction_id);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s202 - GetAuction/' + err);
        result.result = -704;
        return res.json(result);
    }
});

router.post('/S202AuctionDealSend', async (req,res) =>{
    var result ={};
    try{
        var {store_id, auction_id, discount_price} = req.body;
        //자릿수 10000원대만 나오게 sanitize
        discount_price = parseInt(discount_price/10000)*10000;
        var info = await store.get702NeededInfoForDeal(store_id, auction_id);
        console.log(info)
        if(info.result !== define.const_SUCCESS){
            result = {result: info.result}
            return res.json(result);
        }
        //최초입찰이 아니라면 체크
        if(info.data.now_discount_price !== 0){
        //최근 입찰자가 자신인지 확인
            if(info.data.now_order === info.data.deal_order){
                result.result = -705
                result.errMessage = '가장 최근 입찰자가 본인입니다.'
                return res.json(result);
            }
            //제시한 가격이 최소 +10000인지 확인
            if(info.data.now_discount_price >= discount_price){
                result.result = -706;
                result.errMessage = '입찰 금액보다 높게 설정해주세요.'
                return res.json(result);
            }
            //제시한 가격이 50000만 한도 넘었는지 확인
            if(info.data.now_discount_price +50000 < discount_price){
                result.result = -707;
                result.errMessage = '한번에 최대 입찰 금액은 50000원입니다.'
                return res.json(result);
            }
        }
        if(info.data.deal_id === null || info.data.deal_id === undefined){
            var paramArray = [
                store_id, 
                auction_id, 
                discount_price, 
                info.store_nick
            ]
            result = await store.insert702DealSend(paramArray);
            if(result.result !== define.const_SUCCESS){
                return res.json({result: result.result});
            }
        }
        else if(info.data.deal_id !== null){
            result = await store.update702DealSend(info.data.deal_id, auction_id, discount_price);
            if(result.result !== define.const_SUCCESS){
                return res.json({result: result.result});
            }
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s202 - DealSend/' + err);
        result.result = -708;
        return res.json(result);
    }
});

router.get('/S301MyOngoingDeal', async (req, res) =>{
    var result ={};
    try{
        var {store_id} = req.query;
        result = await store.get801MyOngoingDeal(store_id);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s301 - MyOngoingDeal/' + err);
        result.result = -709;
        return res.json(result);
    }
});

router.get('/S302MyPreviousDeal', async (req, res) =>{
    var result ={};
    try{
        var {store_id} = req.query;
        result = await store.get802MyPreviousDeal(store_id);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s302 - MyPreviousDeal/' + err);
        result.result = -709;
        return res.json(result);
    }
});

router.get('/S303MyDealDetail', async (req, res) =>{
    var result ={};
    try{
        var {deal_id} = req.query;
        result = await store.get803MyDealDetail(deal_id);
        if(result.result !== define.const_SUCCESS){
            throw(result.result);
        }
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s302 - MyPreviousDeal/' + err);
        result.result = -709;
        return res.json(result);
    }
});

// store myPage

router.get('/myPageNeededInfo801', async(req,res) =>{
    var result ={};
    try{
        var {partner_id} = req.query;
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

router.post('/myPageHelp802', async(req,res) =>{
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

router.get('/myReview803', async(req,res) =>{
    var result ={};
    try{
        var {partner_id} = req.query;
        if(!partner_id){
            return res.json({result: 8032});
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

router.post('/changePassword804', async(req,res) =>{
    var result ={};
    var {partner_id} = req.body;
    //old_pwd: 과거 비번, new_pwd: 바뀌는 비번
    if(!partner_id || !req.body.old_pwd || !req.body.new_pwd){
        //input 존재하지 않음
        return res.json({result: 80401});
    }
    if(!helper.isValidPassword(req.body.new_pwd)){
        return res.json({result: -80405});
    }
    try{
        const pwd = await myPage.getPartnerPassword804(partner_id);
        if(pwd.result !== define.const_SUCCESS){
            //getPartnerPassword804에서 뭔가 실패
            return res.json({result: pwd.result});
        }
        if(!helper.comparePassword(req.body.old_pwd, pwd.hash_pwd)){
            return res.json({result: 80402});
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
        result.result = -8060;
        return res.json(result);
    }
});

router.post('/partnerShutAccount810', async(req,res) =>{
    var result ={};
    try{
        var {partner_id} = req.body;
        if(!partner_id){
            return res.json({result: -8102});
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