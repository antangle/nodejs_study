const Pool = require('./pool');
const define = require('../../definition/define');
const e = require('express');

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
    console.error('idle client error', err.message, err.stack);
});

//user mypage
const myPageNeededInfo401 = async(user_id)=>{
    var result = {};
    try{
      const querytext = `
      SELECT users.nick, joinTB.device_name,
        joinTB.url_2x, joinTB.brand_id
      FROM users
      LEFT JOIN (
        SELECT temp.user_id, device.name AS device_name, image.url_2x, 
        brand.id AS brand_id
        FROM auction_temp AS temp
        INNER JOIN device
        ON temp.user_id = $1
        AND device.id = temp.device_id
        INNER JOIN image
        ON image.id = device.image_id
        INNER JOIN brand
        ON brand.id = device.brand_id
      ) AS joinTB
      ON joinTB.user_id = $1
      WHERE users.id = $1
    `;
      var {rows, rowCount, errcode} = await query(querytext, [user_id], -4012);
      if(errcode){
          return {result: errcode};
      }
      if(rowCount === 0){
          return {result: -4013};
      }
      result = {
        result: define.const_SUCCESS,
        info: rows
      }
      return result;
    }
    catch(err){
      result.result = -4011;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const myPageHelp402 = async(user_id, type, comment)=>{
    var result = {};
    try{
      const querytext = `
      INSERT INTO help_user(user_id, type, comment)
        SELECT id, $2, $3
        FROM users
        WHERE users.id = $1
    `;
      var {rows, rowCount, errcode} = await query(querytext, [user_id, type, comment], -4022);
      if(errcode){
        return {result: errcode}  
      }
      if(rowCount === 0){
        return {result: -4023}
      }
      else if(rowCount > 1){
        return {result: -4024}
      }
      result.result = define.const_SUCCESS;
      return result;
    }
    catch(err){
      result.result = -4021;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const myReview403 = async(user_id)=>{
  var result = {};
  try{
    const querytext = `
    SELECT score.score, score.deal_id, 
      score.store_id, score.user_id,
      score.comment, score.create_date,
      device.name AS device_name,
      detail.volume, detail.color_name,
      deal.store_nick
    FROM score
    INNER JOIN deal
      ON score.user_id = $1
      AND deal.id = score.deal_id
    INNER JOIN device_detail AS detail
      ON detail.id = deal.device_detail_id
    INNER JOIN device
      ON device.id = deal.device_id
  `;
    var {rows, rowCount, errcode} = await query(querytext, [user_id], -4032);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount === 0){
        return {result: -4033};
    }
    result = {review: rows, rowCount: rowCount, result: define.const_SUCCESS}
    return result;
  }
  catch(err){
    result.result = -4031;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

const CheckNick404 = async(nick)=>{
  var result = {};
  try{
      const querytext = `
          SELECT
              COALESCE(
                  (SELECT 40402 FROM users 
                  WHERE nick = $1), 1) AS match
                  `;
      var {rows, rowCount, errcode} = await query(querytext, [nick], -40402);
      if(errcode){
        return {result: errcode};
      }
      if(rowCount === 0){
        return {result: -40403}
      }
      if(rowCount > 1){
        return {result: -40404}
      }

      result = {result: rows[0].match};
      return result;
  }
  catch(err){
      result.result = -40401;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
  }
};

const changeNick404 = async(nick, user_id)=>{
  var result = {};
  try{
      const querytext = `
          UPDATE users SET 
          nick = $1,
          update_time = current_timestamp
          WHERE id = $2
          AND NOT EXISTS(
            SELECT 1 FROM users
            WHERE nick = $1
          )
          RETURNING nick
          `;
      var {rows, rowCount, errcode} = await query(querytext, [nick, user_id], -40412);
      if(errcode){
        return {result: errcode};
      }
      if(rowCount === 0){
        return {result: -40413}
      }
      if(rowCount > 1){
        return {result: -40414}
      }
      result ={result: define.const_SUCCESS, nick: rows[0].nick};
      return result;
  }
  catch(err){
      result.result = -40411;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
  }
};

const changeLocationInfo = async(user_id)=>{
  var result = {};
  try{
      const querytext = `
        SELECT sd.name AS sido_name, sgg.name AS sgg_name
        FROM users
        INNER JOIN location_sd AS sd
          ON users.id = $1
          AND sd.code = users.sido_code
        INNER JOIN location_sgg AS sgg
          ON sgg.code = users.sgg_code
      `;
      var {rows, rowCount, errcode} = await query(querytext, [user_id], -40502);
      if(errcode){
          return {result: errcode};
      }
      if(rowCount === 0){
          return {result: -40503}
      }
      if(rowCount > 1){
        return {result: -40504}
      }
      result = {
        result: define.const_SUCCESS, 
        sido_name: rows[0].sido_name,
        sgg_name: rows[0].sgg_name
      };
      return result;
  }
  catch(err){
      result.result = -40501;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
  }
};

const get007SdCode = async()=>{
  var result = {};
  try{
      const querytext = `
          SELECT code, name
          FROM location_sd
          ORDER BY code ASC
          `;
      var {rows, rowCount, errcode} = await query(querytext, [], -40512);
      if(errcode){
          return {result: errcode};
      }
      if(rowCount < 1){
          return {result: -40513}
      }
      result = {result: define.const_SUCCESS, sd: rows};
      return result;
  }
  catch(err){
      result.result = -40511;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
  }
};

const get007SggCode = async(sido_code)=>{
  var result = {};
  try{
      const querytext = `
          SELECT code, name
          FROM location_sgg
          WHERE sido_code = $1
          ORDER BY code ASC
          `;
      var {rows, rowCount, errcode} = await query(querytext, [sido_code], -40522);
      if(errcode){
          return {result: errcode}
      }
      if(rowCount <1){
          return {result: -40523}
      }
      result ={result: define.const_SUCCESS, sgg: rows};
      return result;
  }
  catch(err){
      result.result = -40521;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
  }
};

const post007LocationCode = async(sido_code, sgg_code, user_id)=>{
  var result = {};
  try{
      const querytext = `
          UPDATE users SET
          sido_code = $1,
          sgg_code = $2,
          update_time = current_timestamp
          WHERE id = $3
          AND EXISTS(
              SELECT 1 FROM location_sgg AS sgg
              WHERE sgg.sido_code = $1
              AND sgg.code = $2
          )
      `;
      var {rowCount} = await query(querytext, [sido_code, sgg_code, user_id], -40532);
      if(rowCount < 1){
          return {result: -40533}
          //존재하지 않는 sido, sgg code or user_id.
      }
      else if(rowCount > 1){
          return {result: -40534}
          //예상외의 업뎃
      }
      result ={result: define.const_SUCCESS};
      return result;
  }
  catch(err){
      result.result = -40531;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
  }
};

const getUserPassword406 = async(user_id)=>{
  var result = {};
  try{
    const querytext = `
      SELECT login_pwd FROM users
      WHERE id = $1
      AND EXISTS(
        SELECT 1 FROM users
        WHERE id = $1
      )
    `;
    var {rows, rowCount, errcode} = await query(querytext, [user_id], -40602);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount === 0){
      //존재하지 않는 유저
      return {result: -40603};
    }
    else if(rowCount > 1){
      return {result: -40604};
    }
    result = {hash_pwd: rows[0].login_pwd, result: define.const_SUCCESS};
    return result;
  }
  catch(err){
    result.result = -40601;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

const changeUserPassword406 = async(user_id, hash_pwd)=>{
  var result = {};
  try{
    const querytext = `
      UPDATE users SET
      login_pwd = $2,
      update_time = current_timestamp
      WHERE id = $1
    `;
    var {rows, rowCount, errcode} = await query(querytext, [user_id, hash_pwd], -40605);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount === 0){
        return {result: -40606};
    }
    else if(rowCount > 1){
      return {result: -40607};
    }
    result = {result: define.const_SUCCESS}
    return result;
  }
  catch(err){
    result.result = -40601;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

const UserShutAccount410 = async(user_id) =>{
  var result = {}
  try{
      const querytext = `
          UPDATE users SET
          state = -1,
          update_time = current_timestamp,
          push_token = NULL
          WHERE id = $1
      `;
      var {rows, rowCount, errcode} = await query(querytext, [user_id], -4102);
      if(errcode){
        return {result: errcode};
      }
      if(rowCount === 0){
        return {result: -4103};
      }
      else if(rowCount > 1){
        return {result: -4104};
      }
      return {result: define.const_SUCCESS};
  }
  catch(err){
      result.result = -4101;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
  }
};

//store mypage 401 홈 402 문의 403 리뷰, 404 비번변경, 405 공지사항, 410탈퇴
const myPageNeededInfo801 = async(partner_id)=>{
  var result = {};
  try{
    const querytext = `
      SELECT partner.state, store.score, 
        store.trade_name, store.address
      FROM partner
      LEFT JOIN store
        ON partner.id = $1
        AND store.id = partner.store_id
      LEFT JOIN score
        ON partner.store_id = score.store_id
      WHERE partner.id = $1
    `;
    var {rows, rowCount, errcode} = await query(querytext, [partner_id], -8012);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount === 0){
        return {result: -8013};
    }
    else if(rowCount === 0){
      return {result: -8014};
    }
    result = {
      result: define.const_SUCCESS, 
      state: rows[0].state,
      score: rows[0].score, 
      address: rows[0].address,
      trade_name: rows[0].trade_name
    };
    return result;
  }
  catch(err){
    result.result = -8011;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

const myPageHelp802 = async(partner_id, type, comment)=>{
  var result = {};
  try{
    const querytext = `
    INSERT INTO help_store(partner_id, type, comment)
    SELECT id, $2, $3
        FROM partner
        WHERE partner.id = $1
  `;
    var {rows, rowCount, errcode} = await query(querytext, [partner_id, type, comment], -8022);
    if(errcode){
      return {result: errcode}  
    }
    if(rowCount === 0){
      return {result: -8023}
    }
    else if(rowCount > 1){
      return {result: -8024}
    }
    result.result = define.const_SUCCESS;
    return result;
  }
  catch(err){
    result.result = -8021;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

const myReview803 = async(partner_id)=>{
  var result = {};
  try{
    const querytext = `
      SELECT score.score, score.comment,
        users.nick, device.name AS device_name, 
        auction.win_time
      FROM partner
      INNER JOIN store
        ON partner.id = $1
        AND store.id = partner.store_id 
      INNER JOIN score
        ON score.store_id = store.id
      INNER JOIN users
        ON users.id = score.user_id
      INNER JOIN deal
        ON deal.id = score.deal_id
      INNER JOIN auction
        ON auction.id = deal.auction_id
      INNER JOIN device
        ON device.id = deal.device_id
    `;
    var {rows, rowCount, errcode} = await query(querytext, [partner_id], -8032);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount === 0){
        return {result: 8033};
    }
    result = {review: rows, count: rowCount, result: define.const_SUCCESS}
    return result;
  }
  catch(err){
    result.result = -8031;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};


const getPartnerPassword804 = async(partner_id)=>{
  var result = {};
  try{
    const querytext = `
    SELECT login_pwd FROM partner
    WHERE id = $1
    AND EXISTS(
      SELECT 1 FROM partner
      WHERE id = $1
    )
  `;
    var {rows, rowCount, errcode} = await query(querytext, [partner_id], -80402);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount === 0){
      //존재하지 않는 유저
      return {result: -80403};
    }
    else if(rowCount > 1){
      return {result: -80404};
    }
    result = {hash_pwd: rows[0].login_pwd, result: define.const_SUCCESS}
    return result;
  }
  catch(err){
    result.result = -80401;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

const changePartnerPassword804 = async(partner_id, hash_pwd)=>{
  var result = {};
  try{
    const querytext = `
      UPDATE partner SET
      login_pwd = $2,
      update_time = current_timestamp
      WHERE id = $1
    `;
    var {rows, rowCount, errcode} = await query(querytext, [partner_id, hash_pwd], -40405);
    if(errcode){
      return {result: errcode};
    }
    if(rowCount === 0){
      return {result: -80406};
    }
    else if (rowCount > 1){
      return {result: -80407}
    }
    result = {result: define.const_SUCCESS}
    return result;
  }
  catch(err){
    result.result = -80401;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

const partnerShutAccount810 = async(partner_id) =>{
  var result = {}
  try{
      const querytext = `
        UPDATE partner SET
        store_id = NULL,
        state = -1,
        update_time = current_timestamp,
        push_token = NULL,
        dupinfo = NULL
        WHERE id = $1
      `;
      var {rows, rowCount, errcode} = await query(querytext, [partner_id], -8102);
      if(errcode){
        return {result: errcode};
      }
      if(rowCount === 0){
        return {result: -8103};
      }
      else if(rowCount > 1){
        return {result: -8104};
      }
      return {result: define.const_SUCCESS};
  }
  catch(err){
      result.result = -8101;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
  }
};

module.exports = {
  //user mypage 
  myPageNeededInfo401,
  myPageHelp402,
  myReview403,
  CheckNick404,
  changeNick404,
  changeLocationInfo,
  get007SdCode,
  get007SggCode,
  post007LocationCode,
  getUserPassword406,
  changeUserPassword406,
  UserShutAccount410,
  //store mypage
  myPageNeededInfo801,
  myPageHelp802,
  myReview803,
  getPartnerPassword804,
  changePartnerPassword804,
  partnerShutAccount810
};