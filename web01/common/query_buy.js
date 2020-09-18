const Pool = require('./pool');
const define = require('../../definition/define');

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);  
});

const test = async(device_id)=>{
  var result = {};
  try{
    const querytext = `
      SELECT device.id AS device_id, detail.id as detail_id, 
      payment.id AS payment_id, discount_official
      FROM device
      INNER JOIN device_detail AS detail
      ON detail.id IN(
          SELECT detail.id FROM device_detail AS detail
          WHERE detail.device_id = $1
      )
      AND device.id = $1
      INNER JOIN payment
      ON payment.id IN (
          SELECT payment.id FROM payment
          INNER JOIN device
          ON device.id = $1
          AND payment.generation = device.generation
          )
      LEFT JOIN official
      ON device.id = official.device_id
      AND official.payment_id = payment.id
      AND official.state = 1
      AND detail.volume = official.device_volume
      ORDER BY device.id, detail.id, payment.id
      `;
    var {rows, rowCount, errcode} = await query(querytext, [device_id]);
    if(rowCount === 0){
        console.log('err device_id: ' +device_id);
        result.errDevice = device_id
        return result;
    }
    result = {rows: rows, rowCount: rowCount};
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -1;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

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
    var {rows, rowCount, errcode} = await query(querytext, [], -10002);
    if(errcode){
      return {result: errcode};
    }
    if (rowCount === 0){
      return {result: -10003};
    }
    result.result = define.const_SUCCESS;
    result.device_array = rows;
    return result;
  }
  catch(err){
    result.result = -10001
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
      AND DATE(create_time) = current_date
      `;
    var {rows, rowCount, errcode} = await query(querytext, [user_id], -10012);
    if(errcode){
      return {result: errcode};
    }
    if (rowCount === 0){
      return {result: -10013};
    }
    result.count = rows[0].count;
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -10011;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

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
    var {rows, rowCount, errcode} = await query(querytext, [user_id], -10102);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -10103};
    }
    result = {
      state: rows[0].state, 
      temp_device_id: rows[0].device_id,
      result : define.const_SUCCESS
    };
    // when the user already selected the device, print out device info
    if(result.temp_device_id !== define.const_NULL){
      var temp_device_id = result.temp_device_id;
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
        AND device.state = 1
        INNER JOIN image
        ON device.image_id = image.id
      `;
      var {rows, rowCount, errcode} = await query(querytext2, [temp_device_id], -10104);
      if(errcode){
        return {result: errcode};
      }
      if(rowCount === 0){
        return {result: -10105};
      }
      result.selected_device_array = rows;
    }
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -10101;
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
    var {rows, rowCount, errcode} = await query(querytext, [], -10106);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -10107}
    }
    result.result = define.const_SUCCESS;
    result.device_array = rows;
    return result;
  }
  catch(err){
    result.result = -10101
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
      `;
    }
    var {rows, rowCount, errcode} = await query(querytext, [brand_id], -10112);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -10113}
    }
    result.data = rows;
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -10111;
    console.log(`ERROR: ${result.result}/` + err);
  }
};

const checkIsFirstAuction = async(user_id)=>{
  try{
    var result = {};
    const querytext = `
      SELECT temp.device_id, temp.state FROM auction_temp AS temp
      WHERE EXISTS(
        SELECT 1 FROM device
        WHERE device.id = temp.device_id
      )
      AND temp.user_id = $1
      `;
    var {rows, rowCount, errcode} = await query(querytext, [user_id], -10122);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount > 1){
      return {result: -10123}
    }
    else if (rowCount === 1){
      result = {
        state: rows[0].state, 
        temp_device_id: rows[0].device_id,
        result: define.const_SUCCESS
      }
    }
    else{
      result = {
        state: define.const_NULL,
        temp_device_id: define.const_NULL,
        result: define.const_SUCCESS
      }
    }
    return result;
  }
  catch(err){
    result.result = -10121;
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
    var {rows, rowCount, errcode} = await query(querytext, [user_id, device_id], -10124);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -10125};
    }
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -10121;
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
    var {rows, rowCount, errcode} = await query(querytext, [user_id, device_id], -10126);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -10127}
    }
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -10121;
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
    var {rows, rowCount, errcode} = await query(querytext, [device_id], -10214);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -10215}
    }
    result = {result: define.const_SUCCESS, data: rows, rowCount: rowCount}
    return result;
  }
  catch(err){
    result.result = -10211
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

//check returning device_id, state
const postStep2Update = async(user_id, device_id, check)=>{
  var result = {};
  try{
    if(check.state == -1 || check.state == define.const_NULL || check.temp_device_id == define.const_NULL){
      return {result: -10223}
    }
    else{
      const querytext = `
        UPDATE auction_temp
        SET device_detail_id = $2,
        step = 2
        WHERE user_id = $1
        `;
      var {rows, rowCount, errcode} = await query(querytext, [user_id, device_id], -10224);
      if(errcode){
        return {result: errcode};
      }
      if(rowCount === 0){
        return {result: -10225}
      }
      result.result = define.const_SUCCESS;
    }
    return result;
  }
  catch(err){
    result.result = -10221;
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
    var {rows, rowCount, errcode} = await query(querytext, [user_id], -10302);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -10303}
    }
    result = {
      state: rows[0].state, 
      temp_device_id: rows[0].device_id,
      device_detail_id: rows[0].device_detail_id,
      result: 1
    }
    //error handling when state, device_id, device_detail_id is null
    if(result.state == -1 || result.state == define.const_NULL){
      return {result: -10304};
      //this user\'s temp_auction record is either NULL or DEAD
    }
    else if(result.temp_device_id == define.const_NULL || result.device_detail_id == define.const_NULL){
      return {result: -10305};
      //this user hasen\'t selected from step 1 or 2 yet
    }
    else{
      const querytext2 = `
        SELECT device.id AS device_id,
          device.name AS device_name,
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
      var {rows, rowCount, errcode} = await query(querytext2, [result.temp_device_id, result.device_detail_id], -10306);
      if(errcode){
        return {result: errcode};
      }
      if(rowCount === 0){
        return {result: -10307};
      }
      result.selected_device_array = rows;
      result.result = define.const_SUCCESS;
    }
    return result;
  }
  catch(err){
    result.result = -10301;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

const getStep3PaymentInfo = async(agency, generation, device_detail_id) =>{
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
        AND id in (
          SELECT official.payment_id FROM official
          INNER JOIN device_detail AS detail
          ON detail.id = $3
          AND official.device_id = detail.device_id
          AND official.device_volume = detail.volume
        )
      ORDER BY limitation ASC, price DESC
      `;
    var {rows, rowCount, errcode} = await query(querytext, [agency, generation, device_detail_id], -10312);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -10313};
    }
    result = {payment: rows, result: 1}
    return result;
  }
  catch(err){
    result.result = -10311;
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
    var {rows, rowCount, errcode} = await query(querytext, [device_detail_id, payment_id], -10322);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -10323};
    }
    result = {discount_official: rows[0].discount_official, result: 1};
    return result;
  }
  catch(err){
    result.result = -10321;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
}

const selectAutobetMax = async(device_detail_id, condition, payment_id)=>{
  var result = {};
  try{
    const querytext = `
      SELECT max.discount_price
      FROM autobet_max AS max
      INNER JOIN device_detail AS detail
        ON detail.id = $1
      WHERE max.device_volume_id = detail.device_volume_id
        AND max.condition = $2
        AND max.payment_id = $3
    `;
    var {rows, rowCount, errcode} = await query(querytext, [device_detail_id, condition, payment_id], -10332);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -10333};
    }
    result = {result: define.const_SUCCESS, discount_price: rows[0].discount_price};
    return result;
  }
  catch(err){
    result.result = -10331;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
}
const postStep3Update = async(check, postInput)=>{
  var result = {};
  try{
    if(check.state == -1 || check.state == define.const_NULL){
      return {result: 10333};
    }
    else if(check.temp_device_id == define.const_NULL || check.device_detail_id == define.const_NULL){
      return {result: 10334};
    }
    else{
      const querytext = `
        WITH cte AS(
          UPDATE auction_temp
          SET state = -1,
          step = 3
          WHERE user_id = $1
        )
        INSERT INTO auction(
          user_id, device_detail_id,
          device_id, payment_id,
          agency_use, agency_hope,
          period, contract_list,
          create_time, finish_time,
          now_order, state,
          win_state, condition,
          delivery
        )
        VALUES(
          $1, $2, 
          $3, $4, 
          $5, $6, 
          $7, $8, 
          current_timestamp, current_timestamp + interval '1 day', 
          0 ,1, 
          1, $9,
          $10
        )
        RETURNING auction.id
        `;
      const inputarray = [
        postInput.user_id, check.device_detail_id, 
        check.temp_device_id, postInput.payment_id,
        postInput.agency_use, postInput.agency_hope, 
        postInput.period, postInput.contract_list,
        postInput.condition, postInput.delivery
      ];
      var {rows, rowCount, errcode} = await query(querytext, inputarray, -10334);
      if(errcode){
        return {result: errcode};
      }
      if(rowCount === 0){
        return {result: -10335};
      }
      else if(rowCount > 1){
        return {result: -10336};
      }
      result.auction_id = rows[0].id;
      result.result = define.const_SUCCESS;
    }
    return result;
  }
  catch(err){
    result.result = -10331;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

const insert104AutoBetDealSend = async(auction_id)=>{
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
        INNER JOIN device_detail AS detail
            ON detail.id = auction.device_detail_id
        INNER JOIN autobet
            ON autobet.device_volume_id = detail.device_volume_id
            AND autobet.condition = auction.condition
            AND autobet.payment_id = auction.payment_id
            AND autobet.state = 1
        INNER JOIN payment
            ON payment.id = auction.payment_id
        INNER JOIN official
            ON official.payment_id = auction.payment_id
            AND official.device_volume_id = detail.device_volume_id
        INNER JOIN store_nick
            ON store_nick.id = mod(mod(autobet.id, 500) + auction.now_order + 500 + auction.id*2, 1000)
        INNER JOIN store
            ON store.id = autobet.store_id
        WHERE auction.id = $1
          `;
      var {rows, rowCount, errcode} = await query(querytext, [auction_id], -10338);
      if(errcode){
          return {result: errcode};
      }
      result = {result: define.const_SUCCESS};
      return result;
  }
  catch(err){
      result.result = -10331;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
  }
};

const update104AfterAutoBetDealSend = async(auction_id)=>{
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
        SELECT 
          COUNT(auction.id), auction.id, 
          MAX(deal.discount_price) AS max_discount_price
        FROM auction
        INNER JOIN device_detail AS detail
          ON detail.id = auction.device_detail_id
          AND auction.finish_time > current_timestamp
        INNER JOIN autobet
          ON autobet.device_volume_id = detail.device_volume_id
          AND autobet.condition = auction.condition
          AND autobet.payment_id = auction.payment_id
          AND autobet.state = 1
        INNER JOIN deal
          ON deal.store_id = autobet.store_id
          AND deal.auction_id = auction.id
          AND deal.state = 1
        WHERE                 
          auction.id = $1
        GROUP BY auction.id
      ) AS joined_table
      WHERE joined_table.id = auction.id
          AND auction.now_discount_price < joined_table.max_discount_price 
    `;
    var {rows, rowCount, errcode} = await query(querytext, [auction_id], -10339);
    if(errcode){
        return {result: errcode};
    }
    result = {result: define.const_SUCCESS};
    return result;
  }
  catch(err){
    result.result = -10331;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

const insert104PartyAfterAutobet = async(auction_id)=>{
  var result = {};
  try{
      const querytext = `
      INSERT INTO party(store_id, auction_id, state, finish_time)
        SELECT 
          autobet.store_id, auction.id, 
          1, auction.finish_time
        FROM auction
        INNER JOIN device_detail AS detail
          ON detail.id = auction.device_detail_id
        INNER JOIN autobet
          ON autobet.device_volume_id = detail.device_volume_id
          AND autobet.condition = auction.condition
          AND autobet.payment_id = auction.payment_id
          AND autobet.state = 1
        INNER JOIN deal
          ON deal.store_id = autobet.store_id
          AND deal.auction_id = auction.id
          AND deal.state = 1
        WHERE auction.id = $1
      ON CONFLICT (store_id, auction_id) DO NOTHING
      `;
      var {rows, rowCount, errcode} = await query(querytext, [auction_id], -10340);
      if(errcode){
          return {result: errcode};
      }
      result = {result: define.const_SUCCESS};
      return result;
  }
  catch(err){
      result.result = -10331;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
  }
};

//필요없어짐
const killAuctionTempState = async(user_id)=>{
  var result = {};
  try{
    const querytext = ` 48
      UPDATE auction_temp
      SET state = -1
      WHERE user_id = $1
      `;
    var {rows, rowCount, errcode} = await query(querytext, [user_id]);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -10335};
    }
    else if(rowCount > 1){
      return {result: -10336};
    }
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
    var {rows, rowCount, errcode} = await query(querytext, [user_id], -10412);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -10413};
    }
    else if(rowCount > 1){
      return {result: -10414};
    }
    result = {
      state: rows[0].state, 
      temp_device_id: rows[0].device_id,
      device_detail_id: rows[0].device_detail_id,
      result: define.const_SUCCESS
    };
    //error handling when state, device_id, device_detail_id is null
    if(result.state !== -1){
      return {result: -10415};
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
    var {rows, rowCount, errcode} = await query(querytext2, [result.temp_device_id, result.device_detail_id], -10416);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -10417};
    }
    else if(rowCount > 1){
      return {result: -10418};
    }
    result.selected_device_array = rows;
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -10411;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};




module.exports = {
  test,
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
  countAuctions,
  selectAutobetMax,

  postStep3Update,

  finishAuctionTempDeviceInfo,
  
  killAuctionTempState,
  //Autobet
  insert104AutoBetDealSend,
  update104AfterAutoBetDealSend,
  insert104PartyAfterAutobet
};