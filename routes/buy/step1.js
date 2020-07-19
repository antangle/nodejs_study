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
    var result = {};
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
    result = {
      "state": rows[0].state, 
      "temp_device_id":rows[0].device_id
    }
    // when the user already selected the device, print out device info
    if(result.temp_device_id != -2){
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
    var {rows} = await query(querytext2, [result.temp_device_id]);
    result.selected_device_array = rows;
    }
    result.result = 1;
  }
  catch(err){
    console.log('ERROR: -1011, ' + err);
    result.result = -1011;
  }
  finally{
    return result;
  }
};
//get 6 latest devices 
const getStep1Latest6 = async()=>{
  var result = {};
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
    AND device.state = 1
    AND device.latest = 1
    INNER JOIN image
    ON device.image_id = image.id
    LIMIT 6
      `;
    var {rows} = await query(querytext, []);
    result.result = 1;
    result.device_array = rows;
  }
  catch(err){
    console.log('ERROR: -1012, ' + err);
    result.result = -1012
  }
  finally{
    return result;
  }
};

const getStep1DeviceByBrand = async(brand_id)=>{
  var result = {};
  try{
    let querytext;
    //SKT, Apple, LG
    if(brand_id != 4){
      querytext = `
      SELECT device.name AS device_name, 
      device.id AS device_id,
      device.property,
      device.generation,
      brand.name AS brand_name, image.url_2x
      FROM device
      INNER JOIN brand
      ON device.brand_id = brand.id
      AND brand.id = $1
      AND device.state = 1
      INNER JOIN image
      ON device.image_id = image.id
      ORDER BY birth
      `;
    }
    //other than SKT, Apple, LG
    else{
      querytext = `
      SELECT device.name AS device_name, 
      device.id AS device_id,
      device.property,
      device.generation,
      brand.name AS brand_name, image.url_2x
      FROM device
      INNER JOIN brand
      ON device.brand_id = brand.id
      AND brand.id >= $1
      AND device.state = 1
      INNER JOIN image
      ON device.image_id = image.id
      ORDER BY birth
      `
    }
    var {rows} = await query(querytext, [brand_id]);
    result.data = rows;
    result.result = 1;
  }
  catch(err){
    console.log('ERROR: -1021' + err);
    result.result = -1021;
  }
  finally{
    return result;
  }
}
//save step1 info for beginners
const postStep1Insert = async(user_id, device_id)=>{
  var result = {};
  try{
    const querytext = `
    INSERT INTO auction_temp(user_id, device_id, state, step)
    VALUES($1, $2, 1, 1)
    ON CONFLICT(user_id) DO NOTHING
    `;
    await query(querytext, [user_id, device_id]);
    result.result = 1;
  }
  catch(err){
    console.log('ERROR: 1031' + err);
    result.result = -1031;
  }
  finally{
    return result;
  }
};
//update step1 info & init other records
const postStep1Update = async(user_id, device_id)=>{
  var result = {};
  try{
    const querytext = `
      UPDATE auction_temp
      SET device_detail_id = DEFAULT,
      device_id = $2,
      payment_price = DEFAULT,
      agency_use = DEFAULT,
      agency_hope = DEFAULT,
      period = DEFAULT,
      contract_list = DEFAULT,
      state = 1,
      step = 1
      WHERE user_id = $1
      `;
    await query(querytext, [user_id, device_id]);
    result.result = 1;
  }
  catch(err){
    console.log('ERROR: -1032' + err);
    result.result = -1032;
  }
  finally{
    return result;
  }
};
//step:2
const getStep2ColorVolume = async(device_id)=>{
  var result = {};
  try{
    const querytext = `
    SELECT id, color_name, color_hex, agency, volume
    FROM device_detail
    WHERE device_id = $1
    AND state = 1
    ORDER BY color_hex, volume
      `;
    var {rows} = await query(querytext, [device_id]);
    result = rows;
    result.result = 1;
  }
  catch(err){
    console.log('ERROR: -1111, ' + err);
    result.result = -1111
  }
  finally{
    return result;
  }
};

module.exports = {
  getAuctionTempWithUser,
  getStep1Latest6,
  getStep1DeviceByBrand,
  postStep1Insert,
  postStep1Update,
  getStep2ColorVolume,

};
