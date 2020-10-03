const Pool = require('./pool');
const define = require('../definition/define');

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
    console.error('idle client error', err.message, err.stack);
});

const get501StoreAuction = async(store_id)=>{
    var result = {};
    try{
    const querytext = `
        SELECT deal.id AS deal_id, deal.agency,
            deal.contract_list, deal.state,
            auction.agency_use, auction.agency_hope, auction.finish_time,
            device.name, detail.volume, detail.color_hex, detail.color_name,
            image.url_2x, payment.alias
        FROM deal
        INNER JOIN auction
            ON deal.store_id = $1
            AND deal.state != -1
            AND deal.auction_id = auction.id
        INNER JOIN device_detail AS detail
            ON deal.device_detail_id = detail.id
        INNER JOIN device
            ON deal.device_id = device.id
        INNER JOIN image
            ON device.image_id = image.id
        INNER JOIN payment
            ON deal.payment_id = payment.id
        ORDER BY deal.create_time
        LIMIT 4
    `;
    var {rows, rowCount, errcode} = await query(querytext, [store_id], -50112);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount === 0){
        return {result: 50112}
    }
    result = {myDeal: rows};
    result.result = define.const_SUCCESS;
    return result;
    }
    catch(err){
    result.result = -50111;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
    }    
};

const get501Search = async(store_id)=>{
    var result = {};
    try{
        const querytext = `
        SELECT 
            auction.id AS auction_id,
            auction.agency_use, auction.agency_hope, auction.period,
            auction.contract_list, auction.finish_time, 
            auction.now_discount_price,
            device.name, detail.volume, detail.color_hex, detail.color_name,
            image.url_2x, payment.alias
        FROM auction
        INNER JOIN device_detail AS detail
        ON auction.device_detail_id = detail.id
            AND auction.finish_time > current_timestamp
            AND auction.win_state = 1
            AND auction.id NOT IN (
                SELECT cut.auction_id 
                FROM cut
                WHERE cut.store_id = $1
            )
        INNER JOIN device
            ON auction.device_id = device.id
        INNER JOIN image
            ON device.image_id = image.id
        INNER JOIN payment
            ON auction.payment_id = payment.id
        ORDER BY auction.finish_time
        LIMIT 3
    `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id], -50114);
        if(errcode){
            return {result: errcode, auction: []};
        }
        if(rowCount === 0){
            return {result: 50113, auction: []};
        }
        result = {auction: rows};
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -50111;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const get501Reviews = async(store_id)=>{
    var result = {};
    try{
        const querytext = `
        SELECT score.id AS score_id, score.score, score.comment,
            score.create_date, users.nick, device.name
        FROM score
        INNER JOIN users
            ON users.id = score.user_id
            AND score.store_id = $1
        INNER JOIN deal
            ON score.deal_id = deal.id
        INNER JOIN device
            ON deal.device_id = device.id
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id], -50116);
        if(errcode){
            return {result: errcode, review: []};
        }
        if(rowCount === 0){
            return {result: 50114, review: []}
        }
        result = {review: rows};
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -50111;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const get601Search = async(store_id)=>{
    var result = {};
    try{
        const querytext = `
        SELECT 
            auction.id AS auction_id,
            auction.agency_use, auction.agency_hope, auction.period,
            auction.contract_list, auction.finish_time,
            auction.now_discount_price,
            device.name, detail.volume, detail.color_hex, detail.color_name,
            image.url_2x, payment.alias, users.nick, 
            CASE WHEN 
                auction.id NOT IN (
                    SELECT cut.auction_id 
                    FROM cut
                    WHERE cut.store_id = $1
                )
                    THEN 1
                ELSE -1
            END AS is_cut,
            CASE WHEN 
                auction.id NOT IN (
                    SELECT party.auction_id
                    FROM party
                    WHERE party.store_id = $1
                    AND party.state = 1
                )
                    THEN 1
                ELSE -1
            END AS is_bet   
        FROM auction
        INNER JOIN device_detail AS detail
            ON auction.win_state = 1
            AND auction.state = 1
            AND auction.finish_time > current_timestamp
            AND auction.device_detail_id = detail.id
        INNER JOIN device
            ON device.id = auction.device_id
        INNER JOIN image
            ON image.id = device.image_id
        INNER JOIN payment
            ON payment.id = auction.payment_id
        INNER JOIN users
            ON users.id = auction.user_id
        ORDER BY auction.finish_time DESC
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id], -60112);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: 60112};
        }
        result = {auction: rows, result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60111;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const post601CutInsert = async(store_id, auction_id)=>{
    var result = {};
    try{
        const querytext = `
        INSERT INTO cut(store_id, auction_id, finish_time)
            SELECT $1, auction.id, auction.finish_time
            FROM auction
            WHERE auction.id = $2
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, auction_id], -60122);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60123};
        }
        else if(rowCount > 1){
            return {result: -60124};
        }
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -60121;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const post601CutAuctionUpdate = async(auction_id)=>{
    var result = {};
    try{
        const querytext = `
        UPDATE auction SET
            store_count = store_count +1
        WHERE id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [auction_id], -60125);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60126}
        }
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -60121;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const delete601CutAuction = async()=>{
    var result = {};
    try{
        const querytext = `
            DELETE FROM cut
            WHERE finish_time + interval '3 days' < current_timestamp
        `;
        var {rows, rowCount, errcode} = await query(querytext, [], -60132);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60133};
        }
        console.log(`Total ${rowCount} rows has been deleted`);
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -60131;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const get602Auction = async(auction_id, store_id)=>{
    var result = {};
    try{
        const querytext = `
        SELECT
            auction.id AS auction_id,
            auction.agency_use, auction.agency_hope, auction.period,
            auction.contract_list, auction.finish_time, 
            auction.now_discount_price,
            device.name, detail.volume, detail.color_hex, detail.color_name,
            image.url_2x, payment.alias, deal.id AS deal_id
        FROM auction
        INNER JOIN device_detail AS detail
            ON auction.device_detail_id = detail.id
            AND auction.id = $1
        INNER JOIN device
            ON auction.device_id = device.id
        INNER JOIN image
            ON device.image_id = image.id
        INNER JOIN payment
            ON auction.payment_id = payment.id
        LEFT JOIN deal
            ON deal.store_id = $2
            AND deal.auction_id = $1
            AND deal.state = 1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [auction_id, store_id], -60212);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60213};
        }
        else if(rowCount > 1){
            return {result: -60214};
        }
        result = {result: define.const_SUCCESS, auction: rows};
        return result;
    }
    catch(err){
        result.result = -60211;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

//creates temporary store_nick. also checks for now_discount_price, deal_id
const get602NeededInfoForDeal = async(store_id, auction_id)=>{
    var result = {};
    try{
        const querytext = `
        SELECT store.region, store_nick.nick,
            auction.now_discount_price, auction.now_order,
            deal.id AS deal_id, deal.deal_order, deal.store_nick
        FROM store
        INNER JOIN auction
            ON auction.id = $2
            AND store.id = $1
        INNER JOIN store_nick
            ON store_nick.id = mod(auction.now_order + auction.id*2, 1000)
        LEFT JOIN deal
            ON deal.store_id = $1
            AND deal.auction_id = $2
            AND deal.state = 1
        ORDER BY deal.id DESC
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, auction_id], -60222);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60223};
        }
        else if(rowCount > 1){
            return {result: -60224};
        }
        if(!rows[0].store_nick){
            var tempNick = rows[0].region + rows[0].nick;
            result = {
                store_nick: tempNick, 
                data: rows[0],
                result: define.const_SUCCESS
            };
        }
        else if(rows[0].store_nick){
            result = {
                store_nick: rows[0].store_nick, 
                data: rows[0],
                result: define.const_SUCCESS
            };
        }
            return result;
    }
    catch(err){
        result.result = -60221;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

//재입찰일 경우, 이전 store_nick 가져오고, 이전 입찰들의 state = -1로 변화
//취소 시 cancel 값 -2.
const updateBefore602DealSend = async(deal_id, store_id)=>{
    var result = {};
    try{
        var querytext = `
                UPDATE deal SET
                state = -1
                WHERE id = $1
                AND store_id = $2
                AND state != 2
            `;
        var {rows, rowCount, errcode} = await query(querytext, [deal_id, store_id], -60225);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60226};
        }
        else if(rowCount > 1){
            return {result: -60227};
        }
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -60221;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    } 
};


const updateBefore602DealSendCancel = async(deal_id, store_id)=>{
    var result = {};
    try{
        querytext = `
                UPDATE deal SET
                state = -2
                WHERE auction_id = (
                    SELECT auction_id FROM deal
                    WHERE id = $1
                )
                AND store_id = $2
                AND state NOT IN (2, -2)
            `;
        var {rows, rowCount, errcode} = await query(querytext, [deal_id, store_id], -602250);
        console.log(rowCount)
        if(errcode){
            return {result: errcode};
        } 
        if(rowCount === 0){
            return {result: -602260};
        }
        result.rowCount = rowCount;
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -60221;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    } 
};

const insert602DealSend = async(paramArray) => {
    var result = {};
    try{
        const querytext = `
        INSERT INTO deal(
            store_id, auction_id,
            user_id, device_detail_id,
            device_id, agency,
            contract_list, discount_official,
            discount_price, payment_id,
            discount_payment, period,
            create_time, deal_order,
            state, store_nick,
            condition
        )
        SELECT $1, $2,
            auction.user_id, auction.device_detail_id,
            auction.device_id, auction.agency_hope,
            auction.contract_list, official.discount_official,
            $3, auction.payment_id,
            payment.price*6, auction.period,
            current_timestamp, auction.now_order +1,
            1, $4,
            auction.condition
        FROM auction
        INNER JOIN payment
            ON payment.id = auction.payment_id
            AND auction.id = $2
        INNER JOIN device_detail
            ON device_detail.id = auction.device_detail_id
        LEFT JOIN official
            ON official.payment_id = auction.payment_id
            AND official.device_id = auction.device_id
            AND official.device_volume = device_detail.volume
        RETURNING (id)
        `;

        /*
            var paramArray = [
                store_id, 
                auction_id, 
                discount_price, 
                tempNick
            ]
        */

        var {rows, rowCount, errcode} = await query(querytext, paramArray, -60228);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60229};
        }
        else if(rowCount > 1){
            return {result: -60230};
        }
        result.result = define.const_SUCCESS;
        result.deal_id = rows[0].id;
        return result;
    }
    catch(err){
        result.result = -60221;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateAfter602DealSendInsert = async(auction_id, discount_price) => {
    var result = {};
    try{
        const querytext = `
            UPDATE auction
            SET now_discount_price = (
                CASE WHEN now_discount_price < $2
                    THEN $2
                WHEN now_discount_price >= $2
                    THEN now_discount_price
                END
            ),
            now_order = now_order +1,
            store_count = store_count + 1
            WHERE id = $1
            RETURNING now_discount_price
        `;
        /*var paramArray = [
            store_id,
            auction_id,
            discount_price,
            tempNick
        ]*/
        var {rows, rowCount, errcode} = await query(querytext, [auction_id, discount_price], -60231);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60232};
        }
        else if(rowCount > 1){
            return {result: -60233};
        }
        result = {result: define.const_SUCCESS, now_discount_price: rows[0].now_discount_price};
        return result;
    }
    catch(err){
        result.result = -60221;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateAfter602DealSendInsertCancel = async(auction_id) => {
    var result = {};
    try{
        const querytext = `
            UPDATE auction
            SET now_discount_price = (
                SELECT 
                    MAX(discount_price)
                FROM deal
                WHERE auction_id = $1
                    AND state = 1
            ),
            now_order = now_order + 1,
            store_count = store_count + 1
            WHERE id = $1
        `;
        /*var paramArray = [
            store_id,
            auction_id,
            discount_price,
            tempNick
        ]*/
        var {rows, rowCount, errcode} = await query(querytext, [auction_id], -602310);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -602320};
        }
        else if(rowCount > 1){
            return {result: -602330};
        }
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -60221;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateStorePoint = async(store_id, point)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE store SET
                point = point + $2
            WHERE id = $1
            RETURNING *
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, point], -60243);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60244};
        }
        if(rowCount > 1){
            return {result: -60245}
        }
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -60221;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const insert602Party = async(store_id, auction_id)=>{
    var result = {};
    try{
        const querytext = `
            INSERT INTO party(store_id, auction_id, state, finish_time)
                SELECT $1, $2, 1, finish_time
                FROM auction
            WHERE id = $2
            ON CONFLICT(store_id, auction_id) DO NOTHING
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, auction_id], -60234);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount > 1){
            return {result: -60236};
        }
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -60221;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const deleteParty = async()=>{
    var result = {};
    try{
        const querytext = `
            DELETE FROM party
            WHERE finish_time + interval '3 days' < current_timestamp
        `;
        var {rows, rowCount, errcode} = await query(querytext, [], -60237);
        if(errcode){
            return {result: errcode};
        }
        console.log(`Total ${rowCount} rows has been deleted`);
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -60221;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const updatePartyOnCancel = async(store_id, auction_id)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE party SET
            state = -1
            WHERE store_id = $1,
            auction_id = $2
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, auction_id], -60239);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60240};
        }
        console.log(`Total ${rowCount} rows has been updated at party`);
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -60221;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const updatePartyOnPurchase = async(store_id, auction_id)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE party SET
            state = 2
            WHERE store_id = $1, 
            auction_id = $2
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, auction_id], -60241);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60242};
        }
        console.log(`Total ${rowCount} rows has been updated at party`);
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -60221;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const selectS204Delivery = async(store_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT is_delivery
            FROM store
            WHERE id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id], -60502);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60503};
        }
        if(rowCount > 1){
            return {result: -60504};
        }

        result = {is_delivery: rows[0].is_delivery, result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60501;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateS204StoreDelivery = async(store_id, delivery)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE store SET
                is_delivery = $2
            WHERE id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, delivery], -60512);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60513};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60511;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateS204AutobetDelivery = async(store_id, delivery)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE autobet SET
                delivery = $2
            WHERE store_id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, delivery], -60514);
        if(errcode){
            return {result: errcode};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60511;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const selectS204AutoBetSet = async(store_id, agency, brand_id)=>{
    //input store_id. 이거로 
    var result = {};
    try{
        const querytext = `
            SELECT
                temp.*
            FROM (
                SELECT
                    DISTINCT ON (autobet.autobet_max_id)
                    device.name, 
                    device.brand_id, 
                    device.birth,
                    SUBSTRING(autobet.device_volume_id, '(?<=_)[0-9]+')::INTEGER AS volume,
                    autobet.change_type, 
                    autobet.discount_price,
                    autobet.state,
                    max.discount_price AS max_discount_price,
                    max.id AS autobet_max_id,
                    payment.id AS main_payment_id,
                    payment.alias,
                    store.is_delivery
                FROM autobet
                INNER JOIN autobet_max AS max
                    ON max.id = autobet.autobet_max_id
                INNER JOIN device
                    ON device.id = autobet.device_id
                    AND device.brand_id = $3
                INNER JOIN payment
                    ON payment.id = max.main_payment_id
                INNER JOIN store
                    ON store.id = $1
                WHERE autobet.store_id = $1
                    AND autobet.agency = $2
            ) temp
            ORDER BY temp.birth DESC,
                temp.change_type ASC
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, agency, brand_id], -60412);
        if(errcode){
            return {result: errcode};
        }
        //autobet에 아무것도 없을시
        result = {result: define.const_SUCCESS, info: rows};
        return result;
    }
    catch(err){
        result.result = -60411;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const selectS204AutoBetUnset = async(store_id, agency, brand_id)=>{
    //input store_id. 이거로 
    var result = {};
    try{
        const querytext = `
        SELECT
            device.id,
            device.name, 
            SUBSTRING(max.device_volume_id, '(?<=_)[0-9]+')::INTEGER AS volume,
            max.change_type,
            payment.alias,
            payment.id AS main_payment_id, 
            max.discount_price AS max_discount_price,
            max.id AS autobet_max_id,
            store.is_delivery
        FROM autobet_max AS max
        INNER JOIN device
            ON device.id = SUBSTRING(max.device_volume_id, '[0-9]+(?=_)')::INTEGER
            AND device.brand_id = $3
        INNER JOIN payment
            ON payment.id = max.main_payment_id
        INNER JOIN store
            ON store.id = $1
        WHERE
            max.device_volume_id = max.device_volume_id
            AND max.condition = ($2-1)*2 + max.change_type-1
            AND max.id NOT IN(
                SELECT 
                    autobet.autobet_max_id
                FROM autobet
                INNER JOIN device
                    ON device.id = autobet.device_id
                    AND device.brand_id = $3
                WHERE autobet.store_id = $1
                    AND autobet.agency = $2
            )
        ORDER BY device.birth DESC,
            max.change_type ASC
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, agency, brand_id], -60422);
        if(errcode){
            return {result: errcode};
        }
        //미설정된 기기가 없을 시
        /*
        if(rowCount === 0){
            return {result: 60422};
        }
        */
        result = {result: define.const_SUCCESS, info: rows, unsetCount: rowCount};
        return result;
    }
    catch(err){
        result.result = -60411;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const insertS205AutoBetMax = async(main_payment_id)=>{
    var result = {};
    //autobet_max DB에 기초자료 미리 insert해주는 쿼리. official에 중복자료 없어야 제대로 기능함.
    try{
        const querytext = `
        INSERT INTO autobet_max(
            device_volume_id, condition,
            main_payment_id, agency,
            change_type, discount_price
        )
        SELECT dvi.device_volume_id, (payment.agency-1)*2 + (type.id-1) AS condition,
            payment.id AS payment_id, payment.agency,
            type.id AS type, 0 AS discount_price
        FROM (
            SELECT DISTINCT ON(device_volume_id)
                device_volume_id
            FROM device_detail
        ) dvi
        INNER JOIN device
            ON device.id = SUBSTRING(dvi.device_volume_id, '[0-9]+(?=_)')::INTEGER
        INNER JOIN temp2 AS type
            ON TRUE
        INNER JOIN payment
            ON payment.is_main = 1
            AND payment.state = 1
            AND payment.generation = device.generation
        INNER JOIN official
            ON official.device_volume_id = dvi.device_volume_id
            AND official.payment_id = payment.id
        ON CONFLICT (device_volume_id, condition, main_payment_id) DO NOTHING
        `;
        var {rows, rowCount, errcode} = await query(querytext, [], -60412);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60513};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60511;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateS204AutoBetState = async(store_id, autobet_max_id, state)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE autobet SET
                state = $3
            WHERE store_id = $1   
                AND autobet_max_id = $2
                AND state != $3
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, autobet_max_id, state], -60432);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: 60432};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60431;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

//cancel = 1, 활성화
const updateS204AutoBetMaxActivate = async(store_id, autobet_max_id)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE autobet_max AS max SET
                discount_price = temp.discount_price,
                current_store_id = temp.store_id
            FROM (
                SELECT DISTINCT ON(autobet_max_id)
                    discount_price, store_id
                FROM autobet
                WHERE 
                    store_id = $1
                    AND autobet_max_id = $2
                    AND state = 1
            ) temp
            WHERE max.id = $2
            AND max.discount_price < temp.discount_price
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, autobet_max_id], -60433);
        if(errcode){
            return {result: errcode};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60431;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateS204AutoBetMaxInactivate = async(autobet_max_id)=>{
    var result = {};
    try{
        const querytext = `
        UPDATE autobet_max SET
            discount_price = temp.discount_price,
            current_store_id = temp.store_id
        FROM (
            SELECT
                COALESCE(MAX(autobet.discount_price) OVER (PARTITION BY autobet.store_id), 0) AS discount_price, 
                COALESCE(autobet.store_id, null) AS store_id
            FROM (SELECT 1) temp
            LEFT JOIN autobet
                ON autobet.autobet_max_id = $1
                AND autobet.state = 1
                AND autobet.discount_price = (
                    SELECT MAX(discount_price)
                    FROM autobet
                    WHERE autobet_max_id = $1
                )
            ORDER BY autobet.update_time ASC
            LIMIT 1
        ) temp
        WHERE autobet_max.id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [autobet_max_id], -60434);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60435}
        }
        
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60431;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};


/*
store_id, device_volume_id, 
main_payment_id, condition,
autobet_max_id, device_id, 
discount_price, agency, 
change_type, state
*/
//특정 요금제보다 높은 가격의 payment 들에 대해 autobet upsert
const upsertS204AutoBet = async(paramArray)=>{
    var result = {};
    try{
        const querytext = `
            INSERT INTO autobet(
                store_id, device_volume_id, 
                payment_id, condition,
                autobet_max_id, device_id, 
                discount_price, agency, 
                change_type, delivery
            )
            SELECT
                $1, max.device_volume_id,
                payment.id, max.condition,
                $2, device.id,
                $4, max.agency,
                max.change_type, store.is_delivery
            FROM payment
            INNER JOIN autobet_max AS max
                ON max.id = $2
            INNER JOIN device
                ON device.id = SUBSTRING(max.device_volume_id, '[0-9]+(?=_)')::INTEGER
            INNER JOIN official
                ON official.device_volume_id = max.device_volume_id
                AND official.payment_id = payment.id
            INNER JOIN store
                ON store.id = $1
            WHERE payment.price >= (
                    SELECT price
                    FROM payment
                    WHERE id = $3
                )
                AND payment.agency = max.agency
                AND payment.generation = device.generation
            ON CONFLICT(
                store_id, autobet_max_id,
                payment_id
            )
            DO UPDATE SET
                discount_price = excluded.discount_price,
                state = excluded.state,
                update_time = current_timestamp
        `;
        var {rows, rowCount, errcode} = await query(querytext, paramArray, -60442);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60443}
        }
        
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60441;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateS204AutoBetCurrentMax = async(autobet_max_id)=>{
    var result = {};
    try{
        const querytext = `
        UPDATE autobet_max SET
            discount_price = temp.discount_price,
            current_store_id = temp.store_id
        FROM (
            SELECT
                COALESCE(MAX(autobet.discount_price) OVER (PARTITION BY autobet.store_id), 0) AS discount_price, 
                COALESCE(autobet.store_id, null) AS store_id
            FROM (SELECT 1) temp
            LEFT JOIN autobet
                ON autobet.autobet_max_id = $1
                AND autobet.state = 1
                AND autobet.discount_price = (
                    SELECT MAX(discount_price)
                    FROM autobet
                    WHERE autobet_max_id = $1
                )
            ORDER BY autobet.update_time ASC
            LIMIT 1
        ) temp
        WHERE autobet_max.id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [autobet_max_id], -60444);
        if(errcode){
            return {result: errcode};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60441;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateS204BeforeAutoBetDealSend = async(store_id, autobet_max_id)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE deal SET
                state = -1
            FROM (
                SELECT 
                    auction.id AS auction_id, 
                    autobet.discount_price
                FROM auction
                INNER JOIN autobet
                    ON autobet.store_id = $1
                    AND autobet.autobet_max_id = $2
                    AND autobet.state = 1
                INNER JOIN device_detail AS detail
                    ON detail.id = auction.device_detail_id
                WHERE detail.device_volume_id = autobet.device_volume_id
                    AND auction.condition = autobet.condition
                    AND auction.payment_id = autobet.payment_id
                    AND auction.finish_time > current_timestamp
            ) temp
            WHERE deal.store_id = $1
                AND deal.auction_id = temp.auction_id
                AND deal.discount_price < temp.discount_price
                AND deal.state = 1
            `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, autobet_max_id], -60445);
        if(errcode){
            return {result: errcode};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60441;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const insertS204AutoBetDealSend = async(store_id, autobet_max_id)=>{
    var result = {};
    try{
        const querytext = `
            INSERT INTO deal(
                store_id, auction_id,
                user_id, device_detail_id,
                device_id, agency,
                contract_list, discount_official,
                discount_price, payment_id,
                discount_payment, period,
                create_time, deal_order,
                state, store_nick
            )
            SELECT
                autobet.store_id, auction.id AS auction_id,
                auction.user_id, auction.device_detail_id,
                auction.device_id, auction.agency_hope,
                auction.contract_list, official.discount_official,
                autobet.discount_price, auction.payment_id,
                payment.price*6, auction.period,
                current_timestamp AS create_time, 
                auction.now_order + ROW_NUMBER() OVER (
                	PARTITION BY auction.id
                	ORDER BY autobet.store_id ASC
                ) AS deal_order,
                1 AS state, (store.region || store_nick.nick) AS store_nick
            FROM auction
            INNER JOIN autobet
                ON autobet.store_id = $1
                AND autobet.autobet_max_id = $2
                AND autobet.state = 1
            INNER JOIN device_detail AS detail
                ON detail.id = auction.device_detail_id
            INNER JOIN payment
                ON payment.id = auction.payment_id
            INNER JOIN official
                ON official.payment_id = auction.payment_id
                AND official.device_volume_id = detail.device_volume_id
            INNER JOIN store_nick
                ON store_nick.id = mod(mod(autobet.id, 500) + auction.now_order + 500 + auction.id*2, 1000)
            INNER JOIN store
                ON store.id = autobet.store_id
            LEFT JOIN deal
                ON deal.store_id = $1
                AND deal.auction_id = auction.id
                AND deal.state = 1
            WHERE detail.device_volume_id = autobet.device_volume_id
                AND auction.condition = autobet.condition
                AND auction.payment_id = autobet.payment_id
                AND auction.delivery <= autobet.delivery
                AND auction.finish_time > current_timestamp
                AND (deal.id IS NULL
                    OR deal.discount_price < autobet.discount_price)
            `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, autobet_max_id], -60446);
        if(errcode){
            return {result: errcode};
        }
        //deal 이 1개도 올려지지 않음 = 현재 auction중 자동입찰 요건에 맞는 경매가 없음
        if(rowCount === 0){
            return {result: 60442}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60441;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateS204AfterAutoBetDealSend = async(store_id, autobet_max_id)=>{
    var result = {};
    try{
        const querytext = `
        UPDATE auction SET 
            now_discount_price = 
                CASE WHEN now_discount_price < joined_table.max_discount_price
                    THEN joined_table.max_discount_price
                WHEN now_discount_price >= joined_table.max_discount_price
                    THEN now_discount_price
                END
            ,
            now_order = now_order +joined_table.count,
            store_count = store_count + joined_table.count
        FROM (
            SELECT COUNT(auction.id), auction.id, MAX(deal.discount_price) AS max_discount_price
            FROM auction
            INNER JOIN device_detail AS detail
                ON detail.id = auction.device_detail_id
                AND auction.finish_time > current_timestamp
            INNER JOIN autobet
                ON autobet.store_id = $1
                AND autobet.autobet_max_id = $2
                AND autobet.state = 1
            INNER JOIN deal
                ON deal.store_id = autobet.store_id
                AND deal.auction_id = auction.id
                AND deal.state = 1
            WHERE                 
                detail.device_volume_id = autobet.device_volume_id
                AND auction.condition = autobet.condition
                AND auction.payment_id = autobet.payment_id
                AND auction.delivery <= autobet.delivery
                AND deal.discount_price = autobet.discount_price
            GROUP BY auction.id
        ) AS joined_table
        WHERE joined_table.id = auction.id
            AND auction.now_discount_price < joined_table.max_discount_price 
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, autobet_max_id], -60447);
        if(errcode){
            return {result: errcode};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60441;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const insertS204PartyAfterAutobet = async(store_id, autobet_max_id)=>{
    var result = {};
    try{
        const querytext = `
        INSERT INTO party(store_id, auction_id, state, finish_time)
            SELECT autobet.store_id, auction.id, 1, auction.finish_time
            FROM auction
            INNER JOIN device_detail AS detail
                ON detail.id = auction.device_detail_id
            INNER JOIN autobet
                ON autobet.store_id = $1
                AND autobet.autobet_max_id = $2
                AND autobet.state = 1
            INNER JOIN deal
                ON deal.store_id = autobet.store_id
                AND deal.auction_id = auction.id
                AND deal.state = 1
            WHERE detail.device_volume_id = autobet.device_volume_id
                AND auction.condition = autobet.condition
                AND auction.payment_id = autobet.payment_id
                AND auction.finish_time > current_timestamp
                AND auction.delivery <= autobet.delivery
                AND deal.discount_price = autobet.discount_price
        ON CONFLICT (store_id, auction_id) DO NOTHING
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, autobet_max_id], -60448);
        if(errcode){
            return {result: errcode};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60441;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const get701MyOngoingDeal = async(store_id)=>{
    var result = {};
    try{
        const querytext = `
        SELECT device.name, detail.volume, 
            detail.color_name, detail.color_hex,
            image.url_2x, auction.id AS auction_id,
            auction.finish_time, auction.now_discount_price,
            auction.agency_hope, auction.agency_use,
            auction.contract_list, auction.period,
            deal.id AS deal_id, deal.discount_price AS my_discount_price,
            payment.alias
        FROM deal
        INNER JOIN auction
            ON deal.store_id = $1
            AND deal.state = 1
            AND auction.id = deal.auction_id
            AND auction.finish_time >= current_timestamp
            AND deal.id NOT IN (
                SELECT deal_id 
                FROM cut_deal
                WHERE store_id = $1
            )
        INNER JOIN device_detail AS detail
            ON detail.id = deal.device_detail_id
        INNER JOIN payment
            ON payment.id = deal.payment_id
        INNER JOIN device
            ON device.id = deal.device_id
        INNER JOIN image
            ON image.id = device.image_id
        ORDER BY deal.create_time
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id], -7012);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: 7012};
        }
        result.auction = rows;
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -7011;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const post701CutDealInsert = async(store_id, deal_id)=>{
    var result = {};
    try{
        const querytext = `
        INSERT INTO cut_deal(store_id, deal_id, finish_time)
            SELECT $1, deal.id, auction.finish_time
            FROM deal
            INNER JOIN auction
                ON deal.id = $2
                AND auction.id = deal.auction_id
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, deal_id], -70112);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -70113};
        }
        else if(rowCount > 1){
            return {result: -70114};
        }
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -70111;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const delete701CutDeal = async()=>{
    var result = {};
    try{
        const querytext = `
            DELETE FROM cut_deal
            WHERE finish_time + interval '3 days' < current_timestamp
        `;
        var {rows, rowCount, errcode} = await query(querytext, [], -70122);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -70123};
        }
        console.log(`Total ${rowCount} rows has been deleted`);
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -70121;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const get702MyPreviousDeal = async(store_id)=>{
    var result = {};
    try{
        const querytext = `
        SELECT device.name, detail.volume,
            detail.color_name, detail.color_hex,
            image.url_2x, auction.finish_time,
            deal.id AS deal_id, deal.discount_price AS my_discount_price,
            deal.state AS deal_state,
            auction.contract_list, auction.period,
            auction.agency_hope, auction.agency_use,
            user_phone.phone, user_nick.nick, payment.alias
        FROM deal
        INNER JOIN auction
            ON deal.store_id = $1
            AND deal.state = 2 
            AND auction.id = deal.auction_id
        INNER JOIN device_detail AS detail
            ON detail.id = deal.device_detail_id
        INNER JOIN payment
            ON payment.id = deal.payment_id
        INNER JOIN device
            ON device.id = deal.device_id
        INNER JOIN image
            ON image.id = device.image_id
        INNER JOIN users AS user_nick
            ON user_nick.id = auction.user_id
        LEFT JOIN users AS user_phone 
            ON auction.user_id = user_phone.id
            AND auction.win_time + interval '3 days' > current_timestamp
        ORDER BY deal.create_time
    `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id], -7022);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: 7022};
        }
        result.auction = rows;
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -7021;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const get703MyDealDetail = async(deal_id, store_id)=>{
    var result = {};
    try{
        const querytext = `
        SELECT device.name, detail.volume,
            detail.color_name, detail.color_hex, 
            detail.cost_price, auction.finish_time,
            deal.id AS deal_id, deal.discount_price AS my_discount_price,
            deal.discount_official, deal.state AS deal_state,
            auction.agency_hope, auction.agency_use,
            auction.contract_list, auction.period,
            auction.win_time,
            payment.price AS payment_price, payment.alias
        FROM deal
        INNER JOIN auction
            ON deal.id = $1
            AND deal.store_id = $2
            AND deal.state = 2
            AND auction.id = deal.auction_id
        INNER JOIN payment
            ON payment.id = deal.payment_id
        INNER JOIN device_detail AS detail
            ON detail.id = deal.device_detail_id
        INNER JOIN device
            ON device.id = deal.device_id
    `;
        var {rows, rowCount, errcode} = await query(querytext, [deal_id, store_id], -7032);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -7033};
        }
        else if (rowCount > 1){
            return {result: -7034}
        }
        result.auction = rows;
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -8013;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

module.exports = {
    get501StoreAuction,
    get501Search,
    get501Reviews,
    
    get601Search,
    post601CutInsert,
    post601CutAuctionUpdate,
    delete601CutAuction,
    get602Auction,
    get602NeededInfoForDeal,
    updateBefore602DealSend,
    updateBefore602DealSendCancel,
    insert602DealSend,
    updateAfter602DealSendInsert,
    updateAfter602DealSendInsertCancel,
    updateStorePoint,
    //참여건
    insert602Party,
    deleteParty,

    //자동입찰 택배여부 default
    selectS204Delivery,
    updateS204StoreDelivery,
    updateS204AutobetDelivery,

    //자동입찰 카드
    selectS204AutoBetSet,
    selectS204AutoBetUnset,
    insertS205AutoBetMax,

    //자동입찰 on/off
    updateS204AutoBetState,
    updateS204AutoBetMaxActivate,
    updateS204AutoBetMaxInactivate,

    //자동입찰 진행
    upsertS204AutoBet,
    updateS204AutoBetCurrentMax,
    updateS204BeforeAutoBetDealSend,
    insertS204AutoBetDealSend,
    updateS204AfterAutoBetDealSend,
    insertS204PartyAfterAutobet,

    //자신의 deal
    get701MyOngoingDeal,
    post701CutDealInsert,
    delete701CutDeal,
    get702MyPreviousDeal,
    get703MyDealDetail,

    //party update, not using right now
    updatePartyOnCancel,
    updatePartyOnPurchase
};
   