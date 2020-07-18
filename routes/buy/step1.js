const express = require('express');
const Pool = require('../connect/pool');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: false }));

const pool = Pool.pool;
const query = Pool.query;
pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

//auction step: 1
const getAuctionTempWithUser = async(user_id)=>{
  try{
    var data = {};
    const querytext = `
    SELECT
    COALESCE(
      (SELECT device_id FROM auction_temp 
      WHERE user_id = $1), -2) AS device_id, 
    COALESCE(
      (SELECT state FROM auction_temp
      WHERE user_id = $1), -2) AS state
      `;
    var {rows} = await query(querytext, [user_id]);
    data = {
      "state": rows[0].state, 
      "temp_device_id":rows[0].device_id
    }
    if(data.temp_device_id != -2){
    const querytext2 = `
    SELECT device.name AS device_name,
      device.id AS device_id,
      device.property,
      device.generation,
      brand.name AS brand_name, image.url_2x
      FROM device
      INNER JOIN brand
      ON device.brand_id = brand.id
      AND device.id = $1
      INNER JOIN image
      ON device.image_id = image.id
    `;
    var {rows} = await query(querytext2, [data.temp_device_id]);
    data.selected_device_array = rows;
    }
  }
  catch(err){
    console.log('ERROR: -1011, ' + err);
    data.result = -1011;
  }
  finally{
    return data;
  }
};

const getStep1Latest6 = async()=>{
  var data = {};
  try{
    const querytext = `
    SELECT device.name AS device_name, 
    device.id AS device_id,
    device.property,
    device.generation,
    brand.name AS brand_name, image.url_2x
    FROM device
    INNER JOIN brand
    ON device.brand_id = brand.id
    AND device.latest = 1
    INNER JOIN image
    ON device.image_id = image.id
    LIMIT 6
      `;
    var {rows} = await query(querytext, []);
    data.result = 1;
    data.device_array = rows;
  }
  catch(err){
    console.log('ERROR: -1012, ' + err);
    data.result = -1012
  }
  finally{
    return data;
  }
};

const postStartNewAuction = async(user_id)=>{
  try{
    const querytext = `
    INSERT INTO auction_temp(user_id)
    VALUES($1)
    ON CONFLICT DO NOTHING
    `
    var {rows} = await query(querytext, [user_id])
    return rows;
  }
  catch(err){
    console.log('postStartNewAuction ERROR: ' + err);
    return -2
  }
};

const postResetNewAuction = async(user_id)=>{
  try{
    const querytext = `
      UPDATE auction_temp
      SET device_detail_id = DEFAULT,
      device_id = DEFAULT,
      payment_price = DEFAULT,
      agency_use = DEFAULT,
      agency_hope = DEFAULT,
      period = DEFAULT,
      contract_list = DEFAULT,
      state = 1
      WHERE user_id = $1
      `
    var {rows} = await query(querytext, [user_id])
  }
  catch(err){
    console.log('postResetNewAuction ERROR: ' + err);
    return -2
  }
};

const getDeviceByBrand = async(brand_id)=>{
  var result = {};
  try{
    const querytext = `
    SELECT device.id AS device_id, 
    device.name AS device_name, 
    brand.name AS brand_name, image.url_2X
    FROM device
    INNER JOIN brand
    ON device.brand_id = brand.id
    AND brand.id = $1
    INNER JOIN image
    ON device.image_id = image.id
    `;
    var {rows} = await query(qurytext, [brand_id]);
    result.data = rows;
    result.status = 'success';
  }
  catch(err){
    console.log('getDeviceByBrand ERROR: ' + err);
    result.status = 'fail'
  }
  finally{
    return result;
  }
}

const postBuyStep1 = async(user_id, device_id) =>{
  var result = {};
  try{
    const querytext = `
    UPDATE auction_temp
    SET device_id = $2
    state = 1
    WHERE user_id = $1
    `;
    await query(querytext, [user_id, device_id]);
    result.status = 'success';
  }
  catch(err){
    console.log('postBuyStep1 ERROR: ' + err);
    result.status = 'fail'
  }
  finally{
    return result;
  }
}

module.exports = {
  getAuctionTempWithUser,
  getStep1Latest6,
  
};
