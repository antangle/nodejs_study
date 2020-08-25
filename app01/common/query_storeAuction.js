const Pool = require('./pool');
const define = require('../../definition/define');

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
        return {result: errcode, myDeal: []};
    }
    if(rowCount === 0){
        return {result: 50112, myDeal: []}
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
            image.url_2x, payment.alias,
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
            ON auction.device_id = device.id
        INNER JOIN image
            ON device.image_id = image.id
        INNER JOIN payment
            ON auction.payment_id = payment.id
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
const updateBefore602DealSend = async(deal_id, store_id, cancel)=>{
    var result = {};
    try{
        let querytext;
        if(cancel === -1){
            querytext = `
                UPDATE deal SET
                state = -1
                WHERE id = $1
                AND store_id = $2
                AND state != 2
            `;
        }
        else if(cancel === 1){
            //취소 할 시 해당 auction관련 모든 deal_state = -2
            querytext = `
                UPDATE deal SET
                state = -2
                WHERE auction_id = (
                    SELECT auction_id FROM deal
                    WHERE id = $1
                )
                AND store_id = $2
                AND state != 2
            `;
        }
        var {rows, rowCount, errcode} = await query(querytext, [deal_id, store_id], -60225);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60226};
        }
        else if(rowCount > 1 && cancel === -1){
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
            state, store_nick
        )
        SELECT $1, $2,
            auction.user_id, auction.device_detail_id,
            auction.device_id, auction.agency_hope,
            auction.contract_list, official.discount_official,
            $3, auction.payment_id,
            payment.price*6, auction.period,
            current_timestamp, auction.now_order +1,
            1, $4
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
        RETURNING (auction_id)
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
        return result;
    }
    catch(err){
        result.result = -60221;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateAfter602DealSendInsert = async(auction_id, discount_price, store_count) => {
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
            store_count = store_count + $3
            WHERE id = $1
        `;
        /*var paramArray = [
            store_id,
            auction_id,
            discount_price,
            tempNick
        ]*/
        var {rows, rowCount, errcode} = await query(querytext, [auction_id, discount_price, store_count], -60231);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60232};
        }
        else if(rowCount > 1){
            return {result: -60233};
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
        if(rowCount === 0){
            return {result: -60235};
        }
        else if (rowCount > 1){
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

const selectS204AutoBetInfo = async(store_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT * FROM(
                SELECT DISTINCT ON(detail.device_volume_id) 
                    device.id AS device_id, device.name,
                    autobet.load_time,
                    autobet.state
                FROM autobet
                INNER JOIN device_detail AS detail
                    ON autobet.device_volume_id = detail.device_volume_id
                INNER JOIN device
                    ON device.id = detail.device_id
                WHERE autobet.store_id = $1
            ) distinct_table
            ORDER BY distinct_table.load_time DESC
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id], -60412);
        if(errcode){
            return {result: errcode};
        }
        //autobet에 아무것도 없을시
        if(rowCount === 0){
            return {result: 60412};
        }
        result = {result: define.const_SUCCESS, info: rows};
        return result;
    }
    catch(err){
        result.result = -60411;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateS204AutoBetCancelAll = async(store_id, cancel)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE autobet SET
                state = $2
            WHERE store_id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, cancel], -60422);
        if(errcode){
            return {result: errcode};
        }
        //등록된 자동입찰 없음
        if(rowCount === 0){
            return {result: 60422}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60411;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const selectS205AutoBetInfoBefore = async(store_id, device_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT DISTINCT ON(detail.volume)
                detail.volume, device.name,
                image.url_2x, cte_time.load_time
            FROM device_detail AS detail
            INNER JOIN device
                ON device.id = detail.device_id
                AND device.id = $2
            INNER JOIN image
                ON image.id = device.image_id
            LEFT JOIN(
                SELECT load_time
                FROM autobet
                WHERE autobet.store_id = $1
                    AND autobet.device_id = $2
                ORDER BY load_time DESC
                LIMIT 1
            ) AS cte_time
            ON EXISTS(
                SELECT 1 FROM autobet
                WHERE autobet.store_id = $1
                    AND autobet.device_id = $2
            )
            ORDER BY detail.volume ASC
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, device_id], -60512);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60513};
        }
        result = {result: define.const_SUCCESS, info: rows};
        return result;
    }
    catch(err){
        result.result = -60511;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const selectS205AutoBetInfoAfter = async(device_volume_id, condition)=>{
    var result = {};
    try{
        const querytext = `
            SELECT payment.id AS payment_id, payment.alias,
                payment.generation, payment.limitation,
                max.discount_price AS max_discount_price
            FROM autobet_max AS max
            INNER JOIN payment
                ON payment.id = max.payment_id
            WHERE max.device_volume_id = $1
                AND max.condition = $2
            ORDER BY payment.price DESC
        `;
        var {rows, rowCount, errcode} = await query(querytext, [device_volume_id, condition], -60522);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60523};
        }
        result = {result: define.const_SUCCESS, info: rows};
        return result;
    }
    catch(err){
        result.result = -60521;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const insertS205AutoBetMax = async()=>{
    var result = {};
    //autobet_max DB에 기초자료 미리 insert해주는 쿼리. official에 중복자료 없어야 제대로 기능함.
    try{
        const querytext = `
        INSERT INTO autobet_max(
            device_volume_id, condition,
            payment_id, agency,
            change_type, plan,
            delivery, discount_price
        )
        SELECT official.device_volume_id, (payment.agency-1)*8 + (type1.id-1)*4 + (plan.id-1)*2 + delivery.id-1,
            payment.id, payment.agency,
            type1.id, plan.id,
            delivery.id, 0
        FROM official
        INNER JOIN payment
            ON payment.id = official.payment_id
            AND payment.state = 1
            AND official.state = 1
        INNER JOIN temp2 AS type1
            ON TRUE
        INNER JOIN temp2 AS plan
            ON TRUE
        INNER JOIN temp2 AS delivery
            ON TRUE
        ON CONFLICT (device_volume_id, condition, payment_id) DO NOTHING
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

const upsertS205AutoBet = async(paramArray)=>{
    var result = {};
    try{
        const querytext = `
            WITH cte AS(
                UPDATE autobet_max
                    SET discount_price = $9
                WHERE device_volume_id = $2
                    AND condition = $4
                    AND payment_id = $3
                    AND discount_price < $9
            )
            INSERT INTO autobet(
                store_id, device_volume_id, 
                payment_id, condition,
                agency, change_type, 
                plan, delivery,
                discount_price, state,
                is_payment_main, device_id
            )
            SELECT 
                $1, $2,
                $3, $4,
                $5, $6,
                $7, $8,
                $9, $10,
                $11, $12
            ON CONFLICT(
                device_volume_id, condition,
                payment_id, store_id
            )
            DO UPDATE SET
                discount_price = excluded.discount_price,
                state = excluded.state,
                create_time = current_timestamp,
                is_payment_main = excluded.is_payment_main
        `;
        console.log(paramArray);
        for(var i=0; i<paramArray.length;i++){
            var {rows, rowCount, errcode} = await query(querytext, paramArray[i], -60532);
            if(errcode){
                return {result: errcode};
            }
            if(rowCount === 0){
                return {result: -60533}
            }
            if(rowCount > 1){
                return {result: -60534};
            }
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60531;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateS205BeforeAutoBetDealSend = async()=>{
    var result = {};
    try{
        const querytext = `
            UPDATE deal SET
                state = -1
            FROM auction
            INNER JOIN device_detail AS detail
                ON detail.id = auction.device_detail_id
                AND auction.finish_time > current_timestamp
            INNER JOIN autobet
                ON autobet.device_volume_id = detail.device_volume_id
                AND autobet.condition = auction.condition
                AND autobet.payment_id = auction.payment_id
                AND autobet.state = 1
            WHERE deal.store_id = autobet.store_id
                AND deal.auction_id = auction.id
                AND deal.state = 1
            `;
        var {rows, rowCount, errcode} = await query(querytext, [], -60535);
        if(errcode){
            return {result: errcode};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60531;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const insertS205AutoBetDealSend = async()=>{
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
                1 AS state, COALESCE(deal.store_nick, store.region || store_nick.nick) AS store_nick
            FROM auction
            INNER JOIN device_detail AS detail
                ON detail.id = auction.device_detail_id
                AND auction.finish_time > current_timestamp
            INNER JOIN payment
                ON payment.id = auction.payment_id
            INNER JOIN official
                ON official.payment_id = auction.payment_id
                AND official.device_volume_id = detail.device_volume_id
            INNER JOIN autobet
                ON detail.device_volume_id = autobet.device_volume_id
                AND auction.condition = autobet.condition
                AND auction.payment_id = autobet.payment_id
                AND autobet.state = 1
            INNER JOIN store_nick
                ON store_nick.id = mod(mod(autobet.id, 500) + auction.now_order + 500 + auction.id*2, 1000)
            INNER JOIN store
                ON store.id = autobet.store_id
            LEFT JOIN deal
                ON deal.store_id = autobet.store_id
                AND deal.auction_id = auction.id
                AND deal.state = 1
            LEFT JOIN party
                ON party.store_id = autobet.store_id
                AND party.auction_id = auction.id
            WHERE party.id IS NULL
            `;
        var {rows, rowCount, errcode} = await query(querytext, [], -60536);
        if(errcode){
            return {result: errcode};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60531;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateS205AfterAutoBetDealSend = async()=>{
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
                ON detail.device_volume_id = autobet.device_volume_id
                AND auction.condition = autobet.condition
                AND auction.payment_id = autobet.payment_id
                AND autobet.state = 1
            INNER JOIN deal
                ON deal.store_id = autobet.store_id
                AND deal.auction_id = auction.id
                AND deal.state = 1
            GROUP BY auction.id
        ) AS joined_table
        WHERE joined_table.id = auction.id
        `;
        var {rows, rowCount, errcode} = await query(querytext, [], -60537);
        if(errcode){
            return {result: errcode};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60531;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const insertS205PartyAfterAutobet = async()=>{
    var result = {};
    try{
        const querytext = `
        INSERT INTO party(store_id, auction_id, state, finish_time)
            SELECT autobet.store_id, auction.id, 1, auction.finish_time
            FROM auction
            INNER JOIN device_detail AS detail
                ON detail.id = auction.device_detail_id
                AND auction.finish_time > current_timestamp
            INNER JOIN autobet
                ON detail.device_volume_id = autobet.device_volume_id
                AND auction.condition = autobet.condition
                AND auction.payment_id = autobet.payment_id
                AND autobet.state = 1
            INNER JOIN deal
                ON deal.store_id = autobet.store_id
                AND deal.auction_id = auction.id
                AND deal.state = 1
        ON CONFLICT (store_id, auction_id) DO NOTHING
        `;
        var {rows, rowCount, errcode} = await query(querytext, [], -60538);
        if(errcode){
            return {result: errcode};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60531;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const selectS205AutoBetInfoLoad = async(store_id, device_volume_id, condition, device_id)=>{
    var result = {};
    try{
        const querytext = `
        SELECT 
            a.device_volume_id, a.condition,
            a.agency, a.change_type,
            a.plan, a.delivery,
            a.autobet_name, a.device_name
        FROM(
            SELECT DISTINCT ON (autobet.condition)
                autobet.device_volume_id, autobet.condition,
                autobet.agency, autobet.change_type,
                autobet.plan, autobet.delivery,
                autobet.load_time, autobet.name AS autobet_name,
                device.name AS device_name
            FROM autobet
            INNER JOIN device
                ON device.id = $4
            WHERE autobet.store_id = $1
                AND autobet.device_volume_id = $2
                AND autobet.condition = $3
        ) a
        ORDER BY a.load_time DESC
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, device_volume_id, condition, device_id], -60552);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: 60552};
        }
        result = {result: define.const_SUCCESS, info: rows};
        return result;
    }
    catch(err){
        result.result = -60551;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const selectS205AutoBetInfoLoad2 = async(store_id, device_volume_id, condition, autobet_name)=>{
    var result = {};
    try{
        const querytext = `
            WITH cte AS(
                UPDATE autobet SET
                    load_time = current_timestamp,
                    name = $4
                WHERE store_id = $1
                    AND device_volume_id = $2
                    AND condition = $3
            )
            SELECT
                payment.id AS payment_id, autobet.discount_price
            FROM autobet
            INNER JOIN payment
                ON autobet.store_id = $1
                AND autobet.device_volume_id = $2
                AND autobet.condition = $3
                AND payment.id = autobet.payment_id
            ORDER BY payment.price DESC
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, device_volume_id, condition, autobet_name], -60553);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60554};
        }
        result = {result: define.const_SUCCESS, info: rows};
        return result;
    }
    catch(err){
        result.result = -60551;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updateS205AutoBetCancel = async(store_id, device_volume_id, condition, cancel)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE autobet SET
                state = $4
            WHERE store_id = $1
                AND device_volume_id = $2
                AND condition = $3
        `;
        var {rows, rowCount, errcode} = await query(querytext, [store_id, device_volume_id, condition, cancel], -60562);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -60563};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -60561;
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
            AND auction.win_time + interval '1 day' > current_timestamp
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
    insert602DealSend,
    updateAfter602DealSendInsert,
    updateBefore602DealSend,
    
    //참여건
    insert602Party,
    deleteParty,

    //자동입찰
    selectS204AutoBetInfo,
    updateS204AutoBetCancelAll,
    selectS205AutoBetInfoBefore,
    selectS205AutoBetInfoAfter,

    //autobet, autobet_max에 등록
    upsertS205AutoBet,
    updateS205AutoBetCancel,

    updateS205BeforeAutoBetDealSend,
    insertS205AutoBetDealSend,
    updateS205AfterAutoBetDealSend,
    insertS205PartyAfterAutobet,
    
    //autobet 불러오기기능
    selectS205AutoBetInfoLoad,
    selectS205AutoBetInfoLoad2,

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
   