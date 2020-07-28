const Pool = require('../connect/pool');
const define = require('../../definition/define');

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
    console.error('idle client error', err.message, err.stack);
});
const getDeviceInfoWithDetail_Id = async(device_detail_id)=>{
    var result = {};
    try{
      const querytext = `
      SELECT device.name, detail.color_name, detail.volume, image.url_2x
      FROM device_detail AS detail
      INNER JOIN device
      ON detail.id = $1
      AND detail.device_id = device.id
      INNER JOIN image
      ON device.image_id = image.id
    `;
      var {rows} = await query(querytext, [device_detail_id]);
      result = {rows};
      result.result = define.const_SUCCESS;
      return result;
    }
    catch(err){
      result.result = -2001;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
    
};
const update201AuctionState = async(user_id)=>{
    var result = {};
    try{
      const querytext = `
        UPDATE auction SET state = (
            CASE WHEN finish_time + interval '1 hour' < current_timestamp
            THEN -1
            WHEN finish_time < current_timestamp
            THEN 2
            WHEN finish_time >= current_timestamp
            THEN 1
            END
        )
        WHERE user_id = $1
        RETURNING state
    `;
      await query(querytext, [user_id]);
      result.result = define.const_SUCCESS;
      return result;
    }
    catch(err){
      result.result = -2001;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
    
};
const get201AuctionInfo = async(user_id)=>{
    var result = {};
    try{
      const querytext = `
      SELECT auc.id as auction_id, auc.device_detail_id, 
      auc.payment_id, auc.agency_use,
      auc.agency_hope, auc.finish_time,
      auc.now_discount_price, auc.state, auc.win_state,
      auc.win_deal_id, payment.alias
      FROM auction AS auc
      INNER JOIN payment
      ON auc.user_id = $1
      AND auc.win_state = 1
      AND(auc.state = 1 OR auc.state = 2)
      AND payment.id = auc.payment_id
      ORDER BY auc.finish_time
    `;
      var {rows, rowCount} = await query(querytext, [user_id]);
      
      result = {auction: rows, rowCount: rowCount};
      result.result = define.const_SUCCESS;
      return result;
    }
    catch(err){
      result.result = -2011;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
    
};
const get202AuctionInfo = async(user_id)=>{
    var result = {};
    try{
      const querytext = `
      SELECT auc.id as auction_id, auc.device_detail_id, 
      auc.payment_id, auc.agency_use,
      auc.agency_hope, auc.finish_time,
      auc.now_discount_price, auc.state, auc.win_state,
      auc.win_deal_id, payment.alias, store.phone, store.phone_1,
      score.id AS score_id 
      FROM auction AS auc
      INNER JOIN payment
      ON auc.user_id = $1
      AND payment.id = auc.payment_id
      AND(auc.win_state = 2 OR auc.state = -1)
      LEFT JOIN deal
      ON deal.id = auc.win_deal_id
      LEFT JOIN store
      ON store.id = deal.store_id
      AND auc.win_time + interval '1 day' > current_timestamp
      LEFT JOIN score
      ON score.deal_id = auc.win_deal_id
      ORDER BY auc.finish_time
    `;
      var {rows, rowCount} = await query(querytext, [user_id]);
      result = {auction: rows, rowCount: rowCount};
      result.result = define.const_SUCCESS;
      return result;
    }
    catch(err){
      result.result = -2021;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
    
};
const get203AuctionDeals = async(auction_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT deal.id AS deal_id, deal.store_id, 
            deal.store_nick AS store_nick, store.score,
            deal.discount_price, deal.create_time AS deal_create_time,
            auction.finish_time AS auction_finish_time,
            auction.now_order, deal.deal_order AS deal_order,
            auction.contract_list, auction.period,
            detail.cost_price, deal.discount_official,
            deal.discount_payment,
            payment.price AS payment_price
            FROM deal
            INNER JOIN auction
            ON auction.id = $1
            INNER JOIN payment
            ON payment.id = auction.payment_id
            INNER JOIN store
            ON deal.auction_id = $1
            AND store.id = deal.store_id
            INNER JOIN device_detail AS detail
            ON deal.device_detail_id = detail.id
        `;
        var {rows, rowCount} = await query(querytext, [auction_id]);
        result = {auction: rows, result: define.const_SUCCESS, rowCount: rowCount};
        return result;
    }
    catch(err){
        result.result = -2031;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};
const get204AuctionDealsFinish = async(auction_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT deal.id AS deal_id, deal.store_id, 
            store.name AS store_name, store.score,
            deal.discount_price, deal.create_time AS deal_create_time,
            auction.finish_time AS auction_finish_time, 
            auction.contract_list,
            auction.now_order, auction.period,
            deal.deal_order AS deal_order,
            detail.cost_price, deal.discount_official,
            payment.price AS payment_price
            FROM deal
            INNER JOIN store
            ON store.id = deal.store_id
            AND deal.auction_id = $1
            INNER JOIN auction
            ON deal.auction_id = auction.id
            INNER JOIN payment
            ON payment.id = auction.payment_id
            INNER JOIN device_detail AS detail
            ON deal.device_detail_id = detail.id
            ORDER BY deal.discount_price DESC
            LIMIT 5
        `;
        var {rows} = await query(querytext, [auction_id]);
        result = {auction: rows, result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -2041;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
    
};
const get205DealDetail = async(deal_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT deal.id AS deal_id, store.name AS store_name, 
            detail.id AS device_detail_id, 
            detail.cost_price, device.name AS device_name,
            deal.contract_list, deal.discount_official, deal.discount_price,
            deal.discount_payment, deal.month_price,
            deal.gift, deal.create_time AS deal_create_time,
            payment.price AS payment_price, payment.alias AS payment_alias, 
            payment.data AS payment_data,
            payment.call AS payment_call, 
            payment.text AS payment_text, 
            payment.limitation, payment.generation,
            official.discount_official
            FROM deal
            INNER JOIN store
            ON store.id = deal.store_id
            AND deal.id = $1
            INNER JOIN device
            ON device.id = deal.device_id
            INNER JOIN device_detail AS detail
            ON detail.id = deal.device_detail_id
            INNER JOIN payment
            ON payment.id = deal.payment_id
            LEFT JOIN official
            ON official.device_id = device.id
            AND official.payment_id = payment.id
            AND official.device_volume = detail.volume
        `;
        var {rows} = await query(querytext, [deal_id]);
        result = {deal: rows, result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -2051;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
    
};

const Update208DealConfirmation = async(deal_id)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE auction 
            SET win_deal_id = $1,
            win_state = 2
            WHERE auction.id IN
            (SELECT auction_id FROM deal WHERE id = $1)
            RETURNING win_deal_id
        `;
        var {rows} = await query(querytext, [deal_id]);
        result = {result: define.const_SUCCESS, win_deal_id: rows[0].win_deal_id};
        return result;
    }
    catch(err){
        result.result = -2081;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
    
}

const get209ConfirmedAuction = async(deal_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT deal.id AS deal_id, store.name AS store_name, 
            device.name AS device_name, deal.agency,
            deal.discount_price, deal.month_price,
            deal.gift, payment.alias
            FROM deal
            INNER JOIN store
            ON store.id = deal.store_id
            AND deal.id = $1
            INNER JOIN device
            ON device.id = deal.device_id
            INNER JOIN payment
            ON payment.id = deal.payment_id
        `;
        var {rows} = await query(querytext, [deal_id]);
        result = {deal: rows, result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -2091;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
    
};

const get210InfoForReview = async(deal_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT deal.id AS deal_id, 
            store_id, detail.volume, 
            detail.color_name, device.name
            FROM deal
            INNER JOIN device_detail AS detail
            ON deal.device_detail_id = detail.id
            AND deal.id = $1
            INNER JOIN device
            ON deal.device_id = device.id
        `;
        var {rows} = await query(querytext, [deal_id]);
        result = {info: rows, result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -2101;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
    
};

const insert210Review = async(jsondata)=>{
    var result = {};
    try{
        const querytext = `
            WITH cte AS(
                SELECT score 
                FROM score 
                WHERE deal_id = $3)
            INSERT INTO score(user_id, 
                store_id, score, 
                comment, deal_id, create_date)
            SELECT user_id, store_id, $1, $2, $3, current_date
            FROM deal
            WHERE deal.id = $3
            AND EXISTS(SELECT 1 FROM deal WHERE deal.id = $3)
            ON CONFLICT (deal_id) DO UPDATE 
            SET score = $1,
            comment = $2,
            create_date = current_date            
            RETURNING (select cte.score from cte)
        `;
        var {score, comment, deal_id} = jsondata;
        var {rows} = await query(querytext, [score, comment, deal_id]);
        var isScoreNull;
        if(!rows[0].score){
            isScoreNull = true;
        }
        result = {isScoreNull: isScoreNull,scoreGap: score - rows[0].score,result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -2102;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
    
};


const update210StoreAfterReview = async(jsondata)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE store
            SET score_sum = score_sum + $1,
            score_weight = score_weight + $2,
            score = (score_sum+$1)*10/($2+ score_weight)
            WHERE store.id IN(
                SELECT store_id FROM deal
                WHERE deal.id = $3
            )`;
        var {scoreGap, weight, deal_id} = jsondata;
        await query(querytext, [scoreGap, weight, deal_id]);
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -2103;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
    
};
const get211StoreDetails = async(store_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT store.id AS store_id, store.score AS avg_score, 
            store.score_weight AS review_count,
            store.comment AS store_comment, 
            score.score AS user_score, 
            score.comment AS user_comment,
            device.name AS device_name,
            deal.store_nick
            FROM store
            INNER JOIN score
            ON store.id = $1
            AND score.store_id = $1
            INNER JOIN deal
            ON deal.id = score.deal_id
            INNER JOIN device
            ON deal.device_id = device.id
            `;
        var {rows} = await query(querytext, [store_id]);
        console.log(rows);
        //later on, gotta decide which review to look upon
        result ={result: define.const_SUCCESS, store: rows[0]};
        return result;
    }
    catch(err){
        result.result = -2103;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
    
};
const get212AllStoreReviews = async(store_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT store.id AS store_id, store.score AS avg_score, 
            store.score_weight AS review_count,
            store.comment AS store_comment, 
            score.score AS my_score, 
            score.comment AS my_comment,
            DATE(score.create_date),
            device.name AS device_name,
            detail.color_name,
            detail.volume
            FROM store
            INNER JOIN score
            ON store.id = $1
            AND score.store_id = $1
            INNER JOIN deal
            ON deal.id = score.deal_id
            INNER JOIN device_detail AS detail
            ON deal.device_detail_id = detail.id
            INNER JOIN device
            ON deal.device_id = device.id
            `;
        var {rows} = await query(querytext, [store_id]);
        console.log(rows)
        //later on, gotta decide which review to look upon
        result ={result: define.const_SUCCESS, review: rows};
        return result;
    }
    catch(err){
        result.result = -2103;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
    
};
module.exports = {
    getDeviceInfoWithDetail_Id,
    update201AuctionState,
    get201AuctionInfo,
    get202AuctionInfo,
    get203AuctionDeals,
    get204AuctionDealsFinish,
    get205DealDetail,
    Update208DealConfirmation,
    get209ConfirmedAuction,
    insert210Review,
    get210InfoForReview,
    update210StoreAfterReview,
    get211StoreDetails,
    get212AllStoreReviews
};
   