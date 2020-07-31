const Pool = require('../connect/pool');
const define = require('../../definition/define');

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
    console.error('idle client error', err.message, err.stack);
});


const get601StoreAuction = async(store_id)=>{
    var result = {};
    try{
      const querytext = `
      SELECT deal.id AS deal_id, deal.agency, deal.contract_list,
      auction.agency_use, auction.agency_hope, auction.finish_time,
      device.name, detail.volume, detail.color_hex, detail.color_name,
      image.url_2x, payment.alias
      FROM deal
      INNER JOIN auction
      ON deal.auction_id = auction.id
      AND deal.store_id = $1
      INNER JOIN device_detail AS detail
      ON deal.device_detail_id = detail.id
      INNER JOIN device
      ON deal.device_id = device.id
      INNER JOIN image
      ON device.image_id = image.id
      INNER JOIN payment
      ON deal.payment_id = payment.id
      LIMIT 4
      `;
      var {rows, rowCount} = await query(querytext, [store_id]);
      if(rowCount === 0){
          throw('query return value doesnt match');
      }
      result = {myDeal: rows};
      result.result = define.const_SUCCESS;
      return result;
    }
    catch(err){
      result.result = -6011;
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
      ON auction.device_detail_id = detail.id
      AND auction.finish_time > current_timestamp
      AND auction.win_state = 1
      AND auction.id NOT IN (
          SELECT cut.auction_id 
          FROM cut
          WHERE cut.store_id = $1)
      INNER JOIN device
      ON auction.device_id = device.id
      INNER JOIN image
      ON device.image_id = image.id
      INNER JOIN payment
      ON auction.payment_id = payment.id
      ORDER BY auction.finish_time
      LIMIT 3
    `;
      var {rows} = await query(querytext, [store_id]);
      result = {auction: rows};
      result.result = define.const_SUCCESS;
      return result;
    }
    catch(err){
      result.result = -6012;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
    
};
const get601Reviews = async(store_id)=>{
    var result = {};
    try{
      const querytext = `
      SELECT score.id AS score_id, score.score, score.comment,
      score.create_date::DATE, users.nick, device.name
      FROM score
      INNER JOIN users
      ON users.id = score.user_id
      AND score.store_id = $1
      INNER JOIN deal
      ON score.deal_id = deal.id
      INNER JOIN device
      ON deal.device_id = device.id
    `;
      var {rows} = await query(querytext, [store_id]);
      result = {review: rows};
      result.result = define.const_SUCCESS;
      return result;
    }
    catch(err){
      result.result = -6013;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
    
};

const get701Search = async(store_id)=>{
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
          WHERE cut.store_id = $1)
      INNER JOIN device
      ON auction.device_id = device.id
      INNER JOIN image
      ON device.image_id = image.id
      INNER JOIN payment
      ON auction.payment_id = payment.id
      ORDER BY auction.finish_time
    `;
      var {rows} = await query(querytext, [store_id]);
      result = {auction: rows, result: define.const_SUCCESS};
      return result;
    }
    catch(err){
      result.result = -7011;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};
const post701CutAuction = async(store_id, auction_id)=>{
    var result = {};
    try{
        const querytext = `
        WITH cte AS(
            UPDATE auction SET
            store_count = store_count +1
            WHERE id = $2
        )
        INSERT INTO cut(store_id, auction_id, finish_time)
        VALUES($1,$2, current_timestamp +interval '2 hours')
    `;
        var {rows} = await query(querytext, [store_id, auction_id]);
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -7012;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};
const delete701CutAuction = async()=>{
    var result = {};
    try{
        const querytext = `
        DELETE FROM cut
        WHERE finish_time < current_timestamp
    `;
        var {rowCount} = await query(querytext, []);
        console.log(`Total ${rowCount} rows has been deleted`)
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -7013;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
    
};

const get702Auction = async(auction_id)=>{
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
      var {rows} = await query(querytext, [auction_id]);
      result = {auction: rows, result:define.const_SUCCESS};
      return result;
    }
    catch(err){
      result.result = -7021;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
    
};

//creates temporary store_nick. also checks for now_discount_price, deal_id
const get702NeededInfoForDeal = async(store_id, auction_id)=>{
    var result = {};
    try{ 
        const querytext = `
        SELECT store.region, store_nick.nick, 
        auction.now_discount_price, auction.now_order,
        deal.id AS deal_id, deal.deal_order
        FROM store
        INNER JOIN auction
        ON auction.id = $2
        AND store.id = $1
        INNER JOIN store_nick
        ON store_nick.id = mod(auction.now_order + auction.id*2, 1000)
        LEFT JOIN deal
        ON deal.store_id = $1
        AND deal.auction_id = $2
    `;
    console.log(rows);
        var {rows, rowCount} = await query(querytext, [store_id, auction_id]);
        if(rowCount === 0){
            throw('no value when performing get702NeededInfoForDeal')
        }
        var tempNick = rows[0].region + rows[0].nick;
        result = {
            store_nick: tempNick, 
            data: rows[0],
            result: define.const_SUCCESS
        };
        return result;
    }
    catch(err){
      result.result = -7022;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
    
};
const insert702DealSend = async(paramArray)=>{
    var result = {};
    try{
        const querytext = `
        WITH cte AS(
            UPDATE auction
            SET now_discount_price = $3,
            now_order = now_order +1,
            store_count = store_count +1
            WHERE id = $2
        )
        INSERT INTO deal(
            store_id, auction_id, 
            user_id, device_detail_id,
            device_id, agency, 
            contract_list, discount_official, 
            discount_price, payment_id,
            discount_payment,
            create_time, deal_order,
            state, store_nick)
        SELECT $1, $2, 
            auction.user_id, auction.device_detail_id,
            auction.device_id, auction.agency_hope,
            auction.contract_list, official.discount_official,
            $3, auction.payment_id,
            payment.price*6,
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
        /*var paramArray = [
            store_id, 
            auction_id, 
            discount_price, 
            tempNick
        ]*/
        var {rowCount} = await query(querytext, paramArray);
        if(rowCount === 0){
            throw('post702DealSend ERROR. Check if discount_price is lower than now_discount_price')
        }
        if(rowCount !== 1){
            throw('post702DealSend something is wrong.. dunno why')
        }
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -7023;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
    
};
const update702DealSend = async(deal_id, auction_id, discount_price)=>{
    var result = {};
    try{
        console.log(deal_id)
        const querytext1 = `
        UPDATE auction
        SET now_discount_price = $1,
            now_order = now_order +1
        WHERE id = $2
        AND now_discount_price < $1
        `;
        var {rowCount} = await query(querytext1, [discount_price, auction_id]);
        if(rowCount === 0){
            throw('post702DealSend1 ERROR. Check if discount_price is lower than now_discount_price')
        }
        if(rowCount !== 1){
            throw('post702DealSend1 something is wrong.. dunno why')
        }
        const querytext2 = `
        UPDATE deal SET
            discount_price = $2, 
            create_time = current_timestamp, 
            deal_order = auc.now_order,
            state = -1
        FROM (
            SELECT now_order FROM auction
            WHERE auction.id = $3) auc
        WHERE deal.id = $1
        `;
        var {rowCount} = await query(querytext2, [deal_id, discount_price, auction_id]);
        if(rowCount === 0){
            throw('post702DealSend2 ERROR. Check if discount_price is lower than now_discount_price')
        }
        if(rowCount !== 1){
            throw('post702DealSend2 something is wrong.. dunno why')
        }
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -7024;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    } 
};

const get801MyOngoingDeal = async(store_id)=>{
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
        ON store_id = $1
        AND deal.state = 1
        AND auction.id = deal.auction_id
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
        var {rows, rowCount} = await query(querytext, [store_id]);
        if(rowCount === 0){
            throw('get801MyOngoingDeal : no return value')
        }
        result.auction = rows;
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -8011;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};
const get802MyPreviousDeal = async(store_id)=>{
    var result = {};
    try{
        const querytext = `
        SELECT device.name, detail.volume, 
        detail.color_name, detail.color_hex,
        image.url_2x, auction.finish_time,
        deal.id AS deal_id, deal.discount_price AS my_discount_price,
        deal.state,
        auction.contract_list, auction.period,
        auction.agency_hope, auction.agency_use,
        users.phone, payment.alias
        FROM deal
        INNER JOIN auction
        ON store_id = $1
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
        LEFT JOIN users
        ON auction.user_id = users.id
        AND auction.win_time + interval '1 day' > current_timestamp
        ORDER BY deal.create_time
    `;
        var {rows, rowCount} = await query(querytext, [store_id]);
        if(rowCount === 0){
            throw('get802MyPreviousDeal : no return value')
        }
        result.auction = rows;
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -8012;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};
const get803MyDealDetail = async(deal_id)=>{
    var result = {};
    try{
        const querytext = `
        SELECT device.name, detail.volume, 
        detail.color_name, detail.color_hex, 
        detail.cost_price, auction.finish_time,
        deal.id AS deal_id, deal.discount_price AS my_discount_price,
        deal.discount_official,
        auction.agency_hope, auction.agency_use,
        auction.contract_list, auction.period,
        auction.win_time,
        payment.price AS payment_price
        FROM deal
        INNER JOIN auction
        ON deal.id = $1
        AND deal.state = 1
        AND auction.id = deal.auction_id
        INNER JOIN payment
        ON payment.id = deal.payment_id
        INNER JOIN device_detail AS detail
        ON detail.id = deal.device_detail_id
        INNER JOIN device
        ON device.id = deal.device_id
    `;
        var {rows, rowCount} = await query(querytext, [deal_id]);
        if(rowCount === 0){
            throw('get802MyPreviousDeal : no return value')
        }
        result = rows;
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
      result.result = -8012;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};
module.exports = {
    get601StoreAuction,
    get601Search,
    get601Reviews,
    get701Search,
    post701CutAuction,
    delete701CutAuction,
    get702Auction,
    get702NeededInfoForDeal,
    insert702DealSend,
    update702DealSend,
    get801MyOngoingDeal,
    get802MyPreviousDeal,
    get803MyDealDetail
};
   