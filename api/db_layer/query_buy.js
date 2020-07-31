const Pool = require('../connect/pool');
const define = require('../../definition/define')

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);  
});

//homepage latest device.
const get100LatestDeviceHomepage = async() =>{
  var result = {};
  try{
  const querytext = `
    SELECT device.name AS device_name, 
    device.id AS device_id,
    device.property,
    device.generation,
    device.comment,
    brand.name AS brand_name, image.url_2x
    FROM device
    INNER JOIN brand
    ON device.brand_id = brand.id
    AND device.state = 1
    AND device.latest = 1
    INNER JOIN image
    ON device.image_id = image.id
    ORDER BY birth
    LIMIT 4
    `;
    var {rows} = await query(querytext, []);
    result.result = define.const_SUCCESS;
    result.device_array = rows;
    return result;
  }
  catch(err){
    result.result = -1012
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
}

//auction step: 1
const getAuctionTempWithUser = async(user_id, device_id)=>{
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
      "temp_device_id": rows[0].device_id,
      "result" :1
    }
    // when the user already selected the device, print out device info
    if(result.temp_device_id !== define.const_NULL || device_id !== undefined){
      var temp_device_id = device_id || result.temp_device_id;
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
      var {rows} = await query(querytext2, [temp_device_id]);
      result.selected_device_array = rows;      
    }
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -1011;
    console.log(`ERROR: ${result.result}/` + err);
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
    result.result = define.const_SUCCESS;
    result.device_array = rows;
    return result;
  }
  catch(err){
    result.result = -1012
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};
const getStep1DeviceByBrand = async(brand_id)=>{
  var result = {};
  try{
    let querytext;
    //SKT, Apple, LG
    if(brand_id <= 3){
      querytext = `
      SELECT device.name AS device_name, 
      device.id AS device_id,
      device.property,
      device.generation,
      brand.name AS brand_name, image.url_2x,
      EXTRACT(YEAR FROM device.birth) AS birth
      FROM device
      INNER JOIN brand
      ON device.brand_id = brand.id
      AND brand.id = $1
      AND device.state = 1
      INNER JOIN image
      ON device.image_id = image.id
      ORDER BY device.birth DESC
      `;
    }
    //other than SKT, Apple, LG
    else{
      querytext = `
      SELECT device.name AS device_name, 
      device.id AS device_id,
      device.property,
      device.generation,
      brand.name AS brand_name, image.url_2x,
      EXTRACT(YEAR FROM device.birth) AS birth
      FROM device
      INNER JOIN brand
      ON device.brand_id = brand.id
      AND brand.id >= $1
      AND device.state = 1
      INNER JOIN image
      ON device.image_id = image.id
      ORDER BY device.birth DESC
      `
    }
    var {rows, rowCount} = await query(querytext, [brand_id]);
    if(rowCount === 0){
      throw('no data with that brand_id')
    }
    result.data = rows;
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -1021;
    console.log(`ERROR: ${result.result}/` + err);
  }
}

const checkIsFirstAuction = async(user_id)=>{
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
      "temp_device_id": rows[0].device_id,
      "result" :1
    }
    return result;
  }
  catch(err){
    result.result = -1031;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};
//save step1 info for beginners
const postStep1Insert = async(user_id, device_id)=>{
  var result = {};
  try{
    const querytext = `
    INSERT INTO auction_temp(user_id, device_id, state, step)
    VALUES($1, $2, 1, 1)
    ON CONFLICT(user_id) DO 
    UPDATE SET user_id = $1,
    device_id = $2,
    state = 1,
    step = 1
    `;
    await query(querytext, [user_id, device_id]);
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -1041;
    console.log(`ERROR: ${result.result}/` + err);
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
      state = 1,
      step = 1
      WHERE user_id = $1 
      `;
    await query(querytext, [user_id, device_id]);
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){  
    result.result = -1032;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

const stepLoad = async() =>{
  
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
    var {rows, rowCount} = await query(querytext, [device_id]);
    result = {result: define.const_SUCCESS, data: rows, rowCount: rowCount}
    return result;
  }
  catch(err){
    result.result = -1113
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

//check returning device_id, state
const postStep2Update = async(user_id, device_id, check)=>{
  var result = {};
  try{
    if(check.state == -1 || check.state == define.const_NULL){
      result.result = -1121;
      console.log('this user\'s temp_auction record is either NULL or DEAD');
    }
    else if(check.temp_device_id == define.const_NULL){
      result.result = -1122;
      console.log('this user hasen\'t selected a device yet');   
    }
    else{
      const querytext = `
        UPDATE auction_temp
        SET device_detail_id = $2,
        step = 2
        WHERE user_id = $1
        `;
      await query(querytext, [user_id, device_id]);
      result.result = define.const_SUCCESS;
    }
    return result;
  }
  catch(err){
    result.result = -1123;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
  
};
//step:3
const getAuctionTempWithUserStep3 = async(user_id)=>{
  try{
    var result = {};
    const querytext = `
    SELECT
    COALESCE(
      (SELECT device_id FROM auction_temp
      WHERE user_id = $1), -2) AS device_id,
    COALESCE(
      (SELECT state FROM auction_temp
      WHERE user_id = $1), -2) AS state,
    COALESCE(
      (SELECT device_detail_id FROM auction_temp
      WHERE user_id = $1), -2) AS device_detail_id
      `;
    var {rows} = await query(querytext, [user_id]);
    result = {
      "state": rows[0].state, 
      "temp_device_id":rows[0].device_id,
      "device_detail_id":rows[0].device_detail_id,
      "result": 1
    }
    //error handling when state, device_id, device_detail_id is null
    if(result.state == -1 || result.state == define.const_NULL){
      result.result = -1211;
      console.log('this user\'s temp_auction record is either NULL or DEAD');
    }
    else if(result.temp_device_id == define.const_NULL || result.device_detail_id == define.const_NULL){
      result.result = -1212;
      console.log('this user hasen\'t selected from step 1 or 2 yet');   
    }
    else{
      const querytext2 = `
        SELECT device.name AS device_name,
          detail.id AS device_detail_id,
          device.property,
          device.generation,
          brand.name AS brand_name, image.url_2x,
          detail.agency
        FROM device
        INNER JOIN brand
          ON device.brand_id = brand.id
          AND device.id = $1
        INNER JOIN image
          ON device.image_id = image.id
        INNER JOIN device_detail AS detail
          ON detail.id = $2
      `;
      var {rows, rowCount} = await query(querytext2, [result.temp_device_id, result.device_detail_id]);
      if(rowCount !== 0){
        result.selected_device_array = rows;
        result.result = define.const_SUCCESS;
      }
      else{
        console.log('no possible values for page: step3::121')
      }
    }
    return result;
  }
  catch(err){
    result.result = -1213;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
  
};

const getStep3PaymentInfo = async(agency, generation) =>{
  var result = {};
  try{
    const querytext = `
      SELECT id AS payment_id, name AS payment_name,
      price, call,
      data, data_condition,
      data_share, data_speed, limitation
      FROM payment
      WHERE agency = $1
      AND generation = $2
      AND state = 1
      ORDER BY limitation ASC, price DESC
      `;
    var {rows} = await query(querytext, [agency, generation]);
    result = {payment: rows, result: 1}
    return result;
  }
  catch(err){
    result.result = -1221;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
  
};

const getSelectedPayment = async(device_detail_id, payment_id)=>{
  var result = {};
  try{
    const querytext = `
      SELECT discount_official
      FROM official
      INNER JOIN device_detail AS detail
      ON detail.id = $1
      AND detail.volume = official.device_volume
      AND official.state = 1
      INNER JOIN payment
      ON payment.id = $2
      AND official.payment_id = payment.id
      INNER JOIN device
      ON device.id = official.device_id
      AND device.id = detail.device_id
      `;
    var {rows, rowCount} = await query(querytext, [device_detail_id, payment_id]);
    if(rowCount === 0){
      return {result: -1223, Message: '등록된 공시지원금이 존재하지 않습니다'}
    }
    result = {discount_official: rows[0].discount_official, result: 1}
    return result;
  }
  catch(err){
    result.result = -1222;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
  
}

const countAuctions = async(user_id) =>{
  var result = {};
  try{
    const querytext = `
      SELECT count(user_id) FROM auction
      WHERE user_id = $1
      `;
    var {rows} = await query(querytext, [user_id]);
    result.count = rows[0].count;
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -1233;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
  
};
const postStep3Update = async(check, postInput)=>{
  var result = {};
  try{
    if(check.state == -1 || check.state == define.const_NULL){
      result.result = -1231;
      console.log('this user\'s temp_auction record is either NULL or DEAD');
    }
    else if(check.temp_device_id == define.const_NULL || check.device_detail_id == define.const_NULL){
      result.result = -1232;
      console.log('this user hasen\'t selected a device yet');
    }
    else{
      const querytext = `
        INSERT INTO auction(user_id,
          device_detail_id,
          device_id,
          payment_id,
          agency_use,
          agency_hope,
          period,
          contract_list,
          create_time,
          finish_time,
          now_order,
          state,
          win_state)
        VALUES(
          $1, $2, $3, $4, $5,
          $6, $7, $8, 
          current_timestamp, 
          current_timestamp + interval '1 hour', 
          0 ,1, 1)
        RETURNING user_id`;
      const inputarray = [
        postInput.user_id, check.device_detail_id, 
        check.temp_device_id, postInput.payment_id,
        postInput.agency_use, postInput.agency_hope, 
        postInput.period, postInput.contract_list
      ]
      var {rows, rowCount} = await query(querytext, inputarray);
      if(rowCount === 0){
        throw('PostStep3 query error');
      }
      result.result = define.const_SUCCESS;
    }
    return result;
  }
  catch(err){
    result.result = -1234;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
  
};

const killAuctionTempState = async(user_id)=>{
  var result = {};
  try{
    const querytext = `
      UPDATE auction_temp
      SET state = -1
      WHERE user_id = $1
      `;
    await query(querytext, [user_id]);
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -1235;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
  
};
const finishAuctionTempDeviceInfo = async(user_id)=>{
  try{
    var result = {};
    const querytext = `
    SELECT
    COALESCE(
      (SELECT device_id FROM auction_temp 
      WHERE user_id = $1), -2) AS device_id, 
    COALESCE(
      (SELECT state FROM auction_temp
      WHERE user_id = $1), -2) AS state,
    COALESCE(
      (SELECT device_detail_id FROM auction_temp
      WHERE user_id = $1), -2) AS device_detail_id
      `;
    var {rows} = await query(querytext, [user_id]);
    result = {
      "state": rows[0].state, 
      "temp_device_id":rows[0].device_id,
      "device_detail_id":rows[0].device_detail_id,
      "result": 1
    }
    //error handling when state, device_id, device_detail_id is null
    if(result.state != -1){
      var errMessage = 'state is not -1'
      throw(errMessage)
    }
    const querytext2 = `
    SELECT device.name AS device_name,
      device.id AS device_id,
      device.property,
      device.generation,
      brand.name AS brand_name, image.url_2x,
      detail.color_hex, detail.color_name, 
      detail.volume, detail.agency
      FROM device
      INNER JOIN brand
      ON device.brand_id = brand.id
      AND device.id = $1
      INNER JOIN image
      ON device.image_id = image.id
      INNER JOIN device_detail AS detail
      ON detail.id = $2
    `;
    var {rows} = await query(querytext2, [result.temp_device_id, result.device_detail_id]);
    result.selected_device_array = rows;
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -1311;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
  
};

module.exports = {
  get100LatestDeviceHomepage,
  getAuctionTempWithUser,
  getStep1Latest6,
  getStep1DeviceByBrand,
  checkIsFirstAuction,
  postStep1Insert,
  postStep1Update,
  getStep2ColorVolume,
  postStep2Update,
  getAuctionTempWithUserStep3,
  getStep3PaymentInfo,
  getSelectedPayment,
  postStep3Update,
  killAuctionTempState,
  countAuctions,
  finishAuctionTempDeviceInfo
};
 