const Pool = require('../connect/pool');
const define = require('../../definition/define');

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
    console.error('idle client error', err.message, err.stack);
    
});
/*SELECT deal.id AS deal_id, deal.agency, deal.contract_list,
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
      ON deal.payment_id = payment.id*/
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
    }
    catch(err){
      result.result = -6011;
      console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
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
    }
    catch(err){
      result.result = -6012;
      console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
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
    }
    catch(err){
      result.result = -6013;
      console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
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
      result = {auction: rows};
      result.result = define.const_SUCCESS;
    }
    catch(err){
      result.result = -7011;
      console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
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
    }
    catch(err){
      result.result = -7011;
      console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
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
    }
    catch(err){
      result.result = -7011;
      console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
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
      result = {auction: rows};
      result.result = define.const_SUCCESS;
    }
    catch(err){
      result.result = -7011;
      console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
      return result;
    }
};
module.exports = {
    get601StoreAuction,
    get601Search,
    get601Reviews,
    get701Search,
    post701CutAuction,
    delete701CutAuction
};
   