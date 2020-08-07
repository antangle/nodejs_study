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
            image.url_2x, payment.alias
        FROM auction
        INNER JOIN device_detail AS detail
            ON auction.id NOT IN (
                SELECT cut.auction_id 
                FROM cut
                WHERE cut.store_id = $1
            )
            AND auction.win_state = 1
            AND auction.finish_time > current_timestamp
            AND auction.device_detail_id = detail.id
        INNER JOIN device
            ON auction.device_id = device.id
        INNER JOIN image
            ON device.image_id = image.id
        INNER JOIN payment
            ON auction.payment_id = payment.id
        ORDER BY auction.finish_time
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
            INNER JOIN cut
            ON auction.id = $2
            AND NOT EXISTS(
                SELECT 1 FROM cut
                WHERE store_id = $1
                AND auction_id = $2
            )
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
            WHERE finish_time < current_timestamp
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

const get602Auction = async(auction_id)=>{
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
            AND auction.id = $1
        INNER JOIN device
            ON auction.device_id = device.id
        INNER JOIN image
            ON device.image_id = image.id
        INNER JOIN payment
            ON auction.payment_id = payment.id
    `;
        var {rows, rowCount, errcode} = await query(querytext, [auction_id], -60212);
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

//재입찰일 경우, 이전 store_nick 가져오고, 이전 입찰들의 state = -1로 변화.
const updateBefore602DealSend = async(deal_id, store_id)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE deal SET
            state = -1
            WHERE id = $1
            AND store_id = $2
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
            SET now_discount_price = $2,
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
            AND auction.finish_time + interval '1 hour' >= current_timestamp
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
            users.phone, payment.alias
        FROM deal
        INNER JOIN auction
            ON deal.store_id = $1
            AND (
                deal.state = 2 OR (
                    deal.state = 1 
                    AND auction.finish_time + interval '1 hour' < current_timestamp
                )
            )
            AND auction.id = deal.auction_id
        INNER JOIN device_detail AS detail
            ON detail.id = deal.device_detail_id
        INNER JOIN payment
            ON payment.id = deal.payment_id
        INNER JOIN device
            ON device.id = deal.device_id
        INNER JOIN image
            ON image.id = device.image_id
        LEFT JOIN users
            ON auction.user_id = users.id
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
            payment.price AS payment_price
        FROM deal
        INNER JOIN auction
            ON deal.id = $1
            AND deal.store_id = $2
            AND deal.state = 1
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
    get701MyOngoingDeal,
    get702MyPreviousDeal,
    get703MyDealDetail
};
   