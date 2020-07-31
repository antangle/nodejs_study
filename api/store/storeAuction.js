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
        return res.json(result);
    }
    catch(err){
        console.log('router ERROR: s101 - GetHomepageInfo/' + err);
        result.result = -601;
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
})
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
module.exports = router;