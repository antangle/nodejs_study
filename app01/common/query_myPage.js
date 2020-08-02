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
      SELECT users.nick
      FROM users
      LEFT JOIN auction_temp AS temp
      ON temp.user_id = $1
      WHERE users.id = $1
    `;
      var {rows, rowCount, errcode} = await query(querytext, [user_id], -4014);
      if(errcode){
          return {result: errcode};
      }
      if(rowCount !== 1){
          return {result: -4013};
      }
      result.nick = rows[0].nick;
      result.result = define.const_SUCCESS;
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
      VALUES($1, $2, $3)
    `;
      var {rows, rowCount, errcode} = await query(querytext, [user_id, type, comment], -4024);
      if(errcode){
          return {result: errcode}  
      }
      if(rowCount !== 1){
          return {result: -4023}
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
    AND deal.user_id = score.user_id
    INNER JOIN device
    ON device.id = deal.device_id
    INNER JOIN device_detail AS detail
    ON detail.id = deal.device_detail_id
  `;
    var {rows, rowCount, errcode} = await query(querytext, [user_id], -4034);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount === 0){
        return {result: -4033};
    }
    result = {review: rows, count: rowCount, result: define.const_SUCCESS}
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
                  (SELECT 1 FROM users 
                  WHERE nick = $1), -2) AS match
                  `;
      var {rows, rowCount, errcode} = await query(querytext, [nick], -40402);
      if(errcode){
        return {result: errcode};
      }
      if(rowCount < 1){
        return {result: -40403}
      }
      if(rowCount > 1){
        return {result: -40404}
      }

      result ={result: define.const_SUCCESS, match: rows[0].match};
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
          create_time = current_date
          WHERE id = $2
          RETURNING id
          `;
      var {rows, rowCount, errcode} = await query(querytext, [nick, user_id], -40412);
      if(errcode){
        return {result: errcode};
      }
      if(rowCount < 1){
        return {result: -40413}
      }
      if(rowCount > 1){
        return {result: -40414}
      }
      result ={result: define.const_SUCCESS, user_id: rows[0].id};
      return result;
  }
  catch(err){
      result.result = -40411;
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
          `;
      var {rows, rowCount, errcode} = await query(querytext, [], -40502);
      if(errcode){
          return {result: errcode};
      }
      if(rowCount < 1){
          return {result: -40514}
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
          `;
      var {rows, rowCount, errcode} = await query(querytext, [sido_code], -40712);
      if(errcode){
          return {result: errcode}
      }
      if(rowCount <1){
          return {result: -40715}
      }
      result ={result: define.const_SUCCESS, sgg: rows};
      return result;
  }
  catch(err){
      result.result = -40713;
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
          sgg_code = $2
          WHERE id = $3
          AND EXISTS(
              SELECT 1 FROM location_sgg AS sgg
              WHERE sgg.sido_code = $1
              AND sgg.code = $2
          )
      `;
      var {rowCount} = await query(querytext, [sido_code, sgg_code, user_id], -40593);
      if(rowCount < 1){
          return {result: -40578}
          //존재하지 않는 sido, sgg code or user_id.
      }
      else if(rowCount > 1){
          return {result: -40579}
          //예상외의 업뎃
      }
      result ={result: define.const_SUCCESS};
      return result;
  }
  catch(err){
      result.result = -9077;
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
    var {rows, rowCount, errcode} = await query(querytext, [user_id], -40603);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount === 0){
      //존재하지 않는 유저
      return {result: -40604};
    }
    result = {hash_pwd: rows[0].login_pwd, result: define.const_SUCCESS}
    return result;
  }
  catch(err){
    result.result = -4060;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

const changeUserPassword406 = async(user_id, hash_pwd)=>{
  var result = {};
  try{
    const querytext = `
      UPDATE users SET
      login_pwd = $2
      WHERE id = $1
    `;
    var {rows, rowCount, errcode} = await query(querytext, [user_id, hash_pwd], -40613);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount === 0){
        return {result: -40612};
    }
    result = {result: define.const_SUCCESS}
    return result;
  }
  catch(err){
    result.result = -40611;
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
      var {rows, rowCount, errcode} = await query(querytext, [user_id], -41013);
      if(errcode){
        return {result: errcode};
      }
      if(rowCount < 1){
        return {result: -41014};
      }
      else if(rowCount > 1){
        return {result: -41015};
      }
      return {result: define.const_SUCCESS};
  }
  catch(err){
      result.result = -41016;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
  }
};

//store mypage 401 홈 402 문의 403 리뷰, 404 비번변경, 405 공지사항, 410탈퇴
const myPageNeededInfo801 = async(partner_id)=>{
  var result = {};
  try{
    const querytext = `
      SELECT partner.state, store.score, store.trade_name,
      store.address
      FROM partner
      LEFT JOIN store
      ON store.partner_id = $1
      AND store.state = 1
      LEFT JOIN score
      ON partner.store_id = score.store_id
      WHERE partner.id = $1
    `;
    var {rows, rowCount, errcode} = await query(querytext, [partner_id], -8014);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount !== 1){
        return {result: -8013};
    }
    result = {
      result: define.const_SUCCESS, 
      state: rows[0].state,
      score: rows[0].score, 
      address: rows[0].address
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
    VALUES($1, $2, $3)
  `;
    var {rows, rowCount, errcode} = await query(querytext, [partner_id, type, comment], -8024);
    if(errcode){
        return {result: errcode}  
    }
    if(rowCount !== 1){
        return {result: -8023}
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
      users.nick, device.name, 
      auction.win_time
      FROM store
      INNER JOIN score
      ON score.store_id = store.id
      AND store.partner_id = $1
      INNER JOIN users
      ON score.user_id = users.id
      INNER JOIN deal
      ON score.deal_id = deal.id
      INNER JOIN auction
      ON deal.auction_id = auction.id
      INNER JOIN device
      ON deal.device_id = device.id
    `;
    var {rows, rowCount, errcode} = await query(querytext, [partner_id], -8034);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount === 0){
        return {result: -8033};
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
    var {rows, rowCount, errcode} = await query(querytext, [partner_id], -80403);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount === 0){
      //존재하지 않는 유저
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
      login_pwd = $2
      WHERE id = $1
    `;
    var {rows, rowCount, errcode} = await query(querytext, [partner_id, hash_pwd], -40413);
    if(errcode){
        return {result: errcode};
    }
    if(rowCount === 0){
        return {result: -80412};
    }
    result = {result: define.const_SUCCESS}
    return result;
  }
  catch(err){
    result.result = -80411;
    console.log(`ERROR: ${result.result}/` + err);
    return result;
  }
};

const StoreShutAccountS410 = async(partner_id) =>{
  var result = {}
  try{
      const querytext = `
        WITH cte AS(
          UPDATE store SET
          state = -1
          WHERE partner_id = $1
        )
          UPDATE partner SET
          state = -1,
          update_time = current_timestamp,
          push_token = NULL
          WHERE id = $1
      `;
      var {rows, rowCount, errcode} = await query(querytext, [partner_id], -41013);
      if(errcode){
        return {result: errcode};
      }
      if(rowCount < 1){
        return {result: -81014};
      }
      else if(rowCount > 1){
        return {result: -81015};
      }
      return {result: define.const_SUCCESS};
  }
  catch(err){
      result.result = -81016;
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
  StoreShutAccountS410
};