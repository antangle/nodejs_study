const Pool = require('./pool');
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
      var {rows, rowCount, errcode} = await query(querytext, [device_detail_id]);
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
            CASE WHEN finish_time + interval '1 day' < current_timestamp
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
        var {rows, rowCount, errcode} =await query(querytext, [user_id], -20112);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -20113}
        }
        var count = 0;
        //state가 전부 -1이면 출력값 없어야함.
        for(var i=0; i<rowCount; ++i){
            if(rows[i].state !== -1){
                count = count + 1;
                break;
            }
        }
        if(count === 0){
            return {result: 20112};
        }
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -20111;
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
            auc.win_deal_id, payment.alias,
            device.name, detail.color_name,
            detail.volume, image.url_2x
        FROM auction AS auc
        INNER JOIN payment
            ON auc.user_id = $1
            AND auc.win_state = 1
            AND (auc.state = 1 OR auc.state = 2)
            AND payment.id = auc.payment_id
        INNER JOIN device
            ON device.id = auc.device_id
        INNER JOIN device_detail AS detail
            ON detail.id = auc.device_detail_id
        INNER JOIN image
            ON image.id = device.image_id
        ORDER BY auc.finish_time
        `;
        var {rows, rowCount, errcode} = await query(querytext, [user_id], -20115);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -20116}
        }
        result = {auction: rows, rowCount: rowCount};
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -20111;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const post201StateUpdate = async(auction_id)=>{
    var result = {};
    try{
        const querytext = `
        UPDATE auction SET state = (
            CASE WHEN finish_time + interval '1 day' < current_timestamp
            THEN -1
            WHEN finish_time < current_timestamp
            THEN 2
            WHEN finish_time >= current_timestamp
            THEN 1
            END
        )
        WHERE id = $1
        RETURNING state
        `;
        var {rows, rowCount, errcode} =await query(querytext, [auction_id], -20122);
        //-20312, -20412
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -20123}
            //-20313, -20413
        }
        else if(rowCount > 1){
            return {result: -20124}   
            //-20314, -20414
        }
        result.result = define.const_SUCCESS;
        result.state = rows[0].state;
        return result;
    }
    catch(err){
        result.result = -20111;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const update202AuctionState = async(user_id)=>{
    var result = {};
    try{
        const querytext = `
        UPDATE auction SET state = (
            CASE WHEN finish_time + interval '1 day' < current_timestamp
            THEN -1
            WHEN finish_time < current_timestamp
            THEN 2
            WHEN finish_time >= current_timestamp
            THEN 1
            END
        )
        WHERE user_id = $1
        RETURNING *
        `;
        var {rows, rowCount, errcode} =await query(querytext, [user_id], -20212);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -20213}
        }
        var count = 0;
        //state가 전부 -1이면 출력값 없어야함.
        for(var i=0; i<rowCount; ++i){
            if(rows[i].state === -1 || rows[i].win_state === 2){
                count = count + 1;
                break;
            }
        }
        if(count === 0){
            return {result: 20212};
        }
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -20211;
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
            auc.now_discount_price, auc.state, 
            auc.win_state, auc.win_deal_id, 
            payment.alias, store.phone, 
            store.phone_1, score.id AS score_id,
            device.name, detail.color_name, 
            detail.volume, image.url_2x
        FROM auction AS auc
        INNER JOIN payment
            ON auc.user_id = $1
            AND payment.id = auc.payment_id
            AND(auc.win_state = 2 OR auc.state = -1)
        INNER JOIN device_detail AS detail
            ON detail.id = auc.device_detail_id
        INNER JOIN device
            ON device.id = auc.device_id
        INNER JOIN image
            ON image.id = device.image_id
        LEFT JOIN deal
            ON deal.id = auc.win_deal_id
        LEFT JOIN store
            ON store.id = deal.store_id
            AND auc.win_time + interval '3 days' > current_timestamp
        LEFT JOIN score
            ON score.deal_id = auc.win_deal_id
        ORDER BY auc.finish_time
    `;
        var {rows, rowCount, errcode} = await query(querytext, [user_id], -20215);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -20216}
        }
        result = {auction: rows, rowCount: rowCount};
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -20211;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const get203AuctionDeals = async(auction_id, user_id, now_order)=>{
    var result = {};
    try{
        const querytext = `
            SELECT deal.id AS deal_id, deal.store_id, 
                deal.store_nick AS store_nick, store.score,
                deal.discount_price, deal.create_time AS deal_create_time,
                auction.finish_time AS auction_finish_time,
                auction.now_order, deal.deal_order,
                auction.contract_list, auction.period, auction.finish_time,
                auction.state, auction.store_count,
                detail.cost_price, deal.discount_official,
                deal.discount_payment,
                payment.price AS payment_price,
                device.name
            FROM auction
            INNER JOIN payment
                ON auction.id = $1
                AND auction.user_id = $2
                AND payment.id = auction.payment_id
            INNER JOIN device_detail AS detail
                ON detail.id = auction.device_detail_id
            INNER JOIN device
                ON device.id = auction.device_id
            LEFT JOIN deal
                ON deal.auction_id = auction.id
                AND deal.deal_order > $3
                AND deal.state != -2
            LEFT JOIN store
                ON deal.auction_id = $1
                AND store.id = deal.store_id
            ORDER BY auction.finish_time DESC
        `;
        var {rows, rowCount, errcode} = await query(querytext, [auction_id, user_id, now_order], -20315);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -20316}
        }
        var isdeal;
        if(rows[0].deal_id === null){
            isdeal = -1;
        }
        else{
            isdeal = 1;
        }
        result = {isdeal: isdeal, auction: rows, result: define.const_SUCCESS, rowCount: rowCount};
        return result;
    }
    catch(err){
        result.result = -20311;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const get204AuctionDealsFinish = async(auction_id, user_id)=>{
    var result = {};
    try{
        const querytext = `
        SELECT deal.id AS deal_id, deal.store_id, 
            deal.store_nick AS store_nick, store.score,
            deal.discount_price, deal.create_time AS deal_create_time,
            auction.finish_time AS auction_finish_time,
            auction.now_order, deal.deal_order,
            auction.contract_list, auction.period, auction.finish_time,
            auction.state, auction.store_count,
            detail.cost_price, deal.discount_official,
            deal.discount_payment,
            payment.price AS payment_price,
            device.name
        FROM auction
        INNER JOIN payment
            ON payment.id = auction.payment_id
            AND auction.id = $1
            AND auction.user_id = $2
        INNER JOIN device_detail AS detail
            ON detail.id = auction.device_detail_id
        INNER JOIN device
            ON device.id = auction.device_id 
        LEFT JOIN deal
            ON deal.auction_id = auction.id
            AND deal.state != -2
        LEFT JOIN store
            ON deal.auction_id = $1
            AND store.id = deal.store_id
        ORDER BY deal.discount_price DESC
        `;
        var {rows, rowCount, errcode} = await query(querytext, [auction_id, user_id], -20415);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -20416}
        }
        result = {auction: rows, result: define.const_SUCCESS, rowCount: rowCount};
        return result;
    }
    catch(err){
        result.result = -20411;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const get205DealDetail = async(deal_id, user_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT deal.id AS deal_id, deal.store_nick AS store_nick, 
                deal.contract_list, deal.discount_official, 
                deal.discount_price,
                deal.discount_payment, deal.month_price,
                deal.gift, deal.create_time AS deal_create_time,
                deal.period, deal.agency,
                payment.price AS payment_price, payment.alias AS payment_alias, 
                payment.data AS payment_data, payment.call AS payment_call, 
                payment.text AS payment_text, 
                payment.limitation, payment.generation,
                official.discount_official,
                device.name, detail.color_name, 
                detail.volume, detail.id AS device_detail_id, 
                detail.cost_price, image.url_2x
            FROM deal
            INNER JOIN store
                ON store.id = deal.store_id
                AND deal.id = $1
                AND deal.user_id = $2
            INNER JOIN device
                ON device.id = deal.device_id
            INNER JOIN device_detail AS detail
                ON detail.id = deal.device_detail_id
            INNER JOIN image
                ON image.id = device.image_id
            INNER JOIN payment
                ON payment.id = deal.payment_id
            LEFT JOIN official
                ON official.device_id = device.id
                AND official.payment_id = payment.id
                AND official.device_volume = detail.volume
        `;
        var {rows, rowCount, errcode} = await query(querytext, [deal_id, user_id], -20512);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -20513}
        }
        else if(rowCount > 1){
            return {result: -20514}
        }
        result = {deal: rows, result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -20511;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const Update208DealConfirmation = async(deal_id, user_id)=>{
    var result = {};
    try{
        const querytext1 = `
            UPDATE deal
            SET state = 2
            WHERE deal.id = $1
            AND deal.user_id = $2
        `;
        var {rows, rowCount, errcode} = await query(querytext1, [deal_id, user_id], -20812);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -20813}
        }
        else if(rowCount > 1){
            return {result: -20814}
        }
        const querytext2 = `
            UPDATE auction
            SET win_deal_id = $1,
                win_state = 2,
                win_time = current_timestamp
            WHERE auction.id IN
            (
                SELECT auction_id 
                FROM deal 
                WHERE id = $1
            )
            AND auction.user_id = $2
            RETURNING win_deal_id
        `;
        var {rows, rowCount, errcode} = await query(querytext2, [deal_id, user_id], -20815);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -20816}
        }
        else if(rowCount > 1){
            return {result: -20817}
        }
        result.win_deal_id = rows[0].win_deal_id;
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -20811;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

const get209ConfirmedAuction = async(deal_id, user_id)=>{
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
                AND deal.user_id = $2
            INNER JOIN device
                ON device.id = deal.device_id
            INNER JOIN payment
                ON payment.id = deal.payment_id
        `;
        var {rows, rowCount, errcode} = await query(querytext, [deal_id, user_id], -20912);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -20913}
        }
        else if(rowCount > 1){
            return {result: -20914}
        }
        result = {deal: rows, result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -20911;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const get210InfoForReview = async(deal_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT deal.id AS deal_id, 
                deal.store_nick, detail.volume, 
                detail.color_name, device.name
            FROM deal
            INNER JOIN device_detail AS detail
                ON detail.id = deal.device_detail_id
                AND deal.id = $1
                AND deal.state = 2
            INNER JOIN device
                ON device.id = deal.device_id
        `;
        var {rows, rowCount, errcode} = await query(querytext, [deal_id], -21012);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -21013}
        }
        else if(rowCount > 1){
            return {result: -21014}
        }
        result = {info: rows, result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -21011;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const insert210Review = async(jsondata)=>{
    /*
        jsondata = {
            score,
            comment,
            deal_id,
            user_id
        }
    */
    var result = {};
    try{
        const querytext = `
            WITH cte AS(
                SELECT score 
                FROM score 
                WHERE deal_id = $3
            )
            INSERT INTO score(
                user_id, store_id, 
                score, comment, 
                deal_id, create_date
            )
            SELECT 
                user_id, store_id, 
                $1, $2, 
                $3, current_timestamp
            FROM deal
            WHERE EXISTS(
                SELECT 1 FROM deal
                WHERE deal.id = $3
            )
            AND deal.id = $3
            AND deal.user_id = $4
            ON CONFLICT (deal_id) DO UPDATE 
            SET score = $1,
                comment = $2,
                create_date = current_date
            RETURNING (
                SELECT cte.score FROM cte
            )
        `;
        var {score, comment, deal_id, user_id} = jsondata;
        var {rows, rowCount, errcode} = await query(querytext, [score, comment, deal_id, user_id], -21022);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -21023};
        }
        else if(rowCount > 1){
            return {result: -21024};
        }
        var isScoreNull = false;
        if(!rows[0].score){
            isScoreNull = true;
        }
        result = {
            isScoreNull: isScoreNull,
            scoreGap: score - rows[0].score,
            result: define.const_SUCCESS
        };
        return result;
    }
    catch(err){
        result.result = -21021;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const update210StoreAfterReview = async(jsondata)=>{
    /*
        jsondata = {
            score,
            comment,
            deal_id,
            user_id,
            scoreGap,
            weight
        }
    */
    var result = {};
    try{
        const querytext = `
            UPDATE store
            SET score_sum = score_sum + $1,
                score_weight = score_weight + $2,
                score = (score_sum+$1) / ($2+ score_weight)
            WHERE store.id IN(
                SELECT store_id FROM deal
                WHERE deal.id = $3
            )`;
        var {scoreGap, weight, deal_id} = jsondata;
        var {rows, rowCount, errcode} = await query(querytext, [scoreGap, weight, deal_id], -21025);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -21026}
        }
        else if(rowCount > 1){
            return {result: -21027}
        }

        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -21023;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const get211StoreDetails = async(deal_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT store.id AS store_id, store.score AS avg_score, 
                store.score_weight AS review_count,
                store.comment AS store_comment,
                score.score AS user_score,
                score.comment AS user_comment,
                score.create_date,
                device.name AS device_name,
                deal.store_nick,
                sd.name AS sido_name, sgg.name AS sgg_name,
                users.hidden_login_id AS user_nick
            FROM deal
            INNER JOIN store
                ON deal.id = $1
                AND store.id = deal.store_id
            INNER JOIN device
                ON deal.device_id = device.id
            LEFT JOIN location_sd AS sd
                ON store.sido_code = sd.code
            LEFT JOIN location_sgg AS sgg
                ON store.sgg_code = sgg.code
            LEFT JOIN score
                ON score.store_id = deal.store_id
            LEFT JOIN users
                ON users.id = score.user_id
            ORDER BY score.create_date DESC
            LIMIT 1
            `;
        var {rows, rowCount, errcode} = await query(querytext, [deal_id], -21112);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -21113}
        }
        else if(rowCount > 1){
            return {result: -21114}
        }
        //later on, gotta decide which review to look upon
        result ={result: define.const_SUCCESS, store: rows[0]};
        return result;
    }
    catch(err){
        result.result = -21111;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const get212AllStoreReviews = async(deal_id)=>{
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
                detail.color_name, detail.volume,
                curr_deal.store_nick, users.hidden_login_id AS user_nick
            FROM deal
            INNER JOIN store
                ON store.id = (
                    SELECT store_id FROM deal
                    WHERE deal.id = $1
                )
            INNER JOIN score
                ON score.store_id = store.id
                AND deal.id = score.deal_id
            INNER JOIN users
                ON users.id = score.user_id
            INNER JOIN device_detail AS detail
                ON detail.id = deal.device_detail_id
            INNER JOIN device
                ON device.id = deal.device_id
            CROSS JOIN (
                SELECT store_nick FROM deal
                WHERE deal.id = $1
            ) AS curr_deal
        `;
        var {rows, rowCount, errcode} = await query(querytext, [deal_id], -21212);
        //TODO: later on, gotta decide which review to look upon
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -21213}
        }
        result = {result: define.const_SUCCESS, review: rows};
        return result;
    }
    catch(err){
        result.result = -21211;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const post213Report = async(deal_id, type, comment)=>{
    var result = {};
    try{
        const querytext = `
            INSERT INTO report(user_id, store_id, deal_id, type, comment)
                SELECT deal.user_id, deal.store_id, $1, $2, $3
                FROM deal
                WHERE deal.id = $1
            `;
        var {rows, rowCount, errcode} = await query(querytext, [deal_id, type, comment], -2132);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -2133};
        }
        else if(rowCount > 1){
            return {result: -2134};
        }
        result ={result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -2131;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

module.exports = {
    getDeviceInfoWithDetail_Id,
    update201AuctionState,
    get201AuctionInfo,
    post201StateUpdate,
    update202AuctionState,
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
    get212AllStoreReviews,
    post213Report,
};
   