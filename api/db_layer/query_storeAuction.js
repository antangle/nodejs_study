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
const get6011StoreAuction = async(store_id)=>{
    var result = {};
    try{
      const querytext = `
      SELECT deal.id AS deal_id, deal.agency, deal.contract_list,
      
      FROM deal
      WHERE deal.store_id = $1
      
    `;
      var {rows} = await query(querytext, [store_id]);
      result = {rows};
      result.result = define.const_SUCCESS;
    }
    catch(err){
      result.result = -2001;
      console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
      return result;
    }
};
const get6012Search = async(store_id)=>{
    var result = {};
    try{
      const querytext = `
      SELECT 
      auction.agency_use, auction.agency_hope, auction.period,
      auction.contract_list, auction.finish_time, 
      auction.now_discount_price
      device.name, detail.volume, detail.color_hex, detail.color_name,
      image.url_2x, payment.alias
      FROM auction
      INNER JOIN device_detail AS detail
      ON auction.device_detail_id = detail.id
      AND auction.state = 1
      INNER JOIN device
      ON auction.device_id = device.id
      INNER JOIN image
      ON device.image_id = image.id
      INNER JOIN payment
      ON auction.payment_id = payment.id
    `;
      var {rows} = await query(querytext, [device_detail_id]);
      result = {rows};
      result.result = define.const_SUCCESS;
    }
    catch(err){
      result.result = -2001;
      console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
      return result;
    }
};
module.exports = {
    get6011StoreAuction,
};
   