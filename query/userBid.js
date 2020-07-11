const Pool = require('./pool');
const express = require('express');

const pool = Pool.pool;
const query = Pool.query;

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: false }));

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

const startBidding = async (req, res) =>{
  try{
    const startBiddingQuery = `
    WITH id AS(
    SELECT id FROM users
    WHERE nickname = $1
    )
    SELECT count(user_id) FROM user_bid a, id
    WHERE a.user_id = id.id
    `;
    const {nickname} = req.body;
    var {rows} = await query(startBiddingQuery, [nickname]);    
    if(rows[0].count >= 3){
      var result = {status: 'bidOver3'};
      return res.json(result);
    }
    else{
    const Insertquery =`
    INSERT INTO temp_user_bid(user_id)
    SELECT id FROM users
    WHERE nickname = $1
    ON CONFLICT DO NOTHING
    `;
    await query(Insertquery, [nickname]);
    var result = {status: 'success'};
    return res.json(result);
    }
  }
  catch(err){
    console.log('startBidding ERROR: ' + err);
    var result = {status: 'fail'};
    return res.json(result);
  }
};

const buyNextStep1 = async (req, res) =>{
  try{
    console.log('atbuy1')
    const querytext = `
    WITH users AS(
      SELECT id FROM users
      WHERE nickname = $1
    )
    UPDATE temp_user_bid
    SET phone_name=$2, phone_company=$3 
    FROM users
    WHERE temp_user_bid.user_id = users.id`;
    const {nickname, phone_name, phone_company} = req.body;
    await query(querytext, [nickname, phone_name, phone_company]);
    var result = {status: 'success'};
    return res.json(result);
  }
  catch(err){
    console.log('buyNextStep1 ERROR: ' + err);
    var result = {status: 'fail'};
    return res.json(result);
  }
};
const buyNextStep2 = async (req, res) =>{
  try{
    var querytext = `
    WITH users AS(
      SELECT id FROM users
      WHERE nickname = $1
    )
    UPDATE temp_user_bid
    SET phone_color=$2, phone_capacity=$3 
    FROM users
    WHERE temp_user_bid.user_id = users.id`;
    const {nickname, phone_color, phone_capacity} = req.body;
    await query(querytext, [nickname, phone_color, phone_capacity]);
    var result = {status: 'success'};
    return res.json(result);
  }
  catch(err){
    console.log('buyNextStep2 ERROR: ' + err);
    var result = {status: 'fail'};
    return res.json(result);
  }
};

const buyNextStep3 = async (req, res) =>{
  try{
    var querytext = `
    WITH users AS(
      SELECT id FROM users
      WHERE nickname = $1
    )
    UPDATE temp_user_bid
    SET current_carrier=$2, want_carrier=$3,
    want_plan=$4, want_payment_period=$5,
    contract=$6, want_contract_period=$7,
    return_phone=$8, six_month_payment_plan=$9,
    affiliate_card=$10
    FROM users
    WHERE temp_user_bid.user_id = users.id`;
    const {nickname, current_carrier, want_carrier,
      want_plan, want_payment_period,
      contract, want_contract_period,
      return_phone, six_month_payment_plan,
      affiliate_card} = req.body;
    await query(querytext, 
      [nickname, current_carrier, want_carrier,
      want_plan, want_payment_period,
      contract, want_contract_period,
      return_phone, six_month_payment_plan,
      affiliate_card]);
    var result = {status: 'success'};
    return res.json(result);
  }
  catch(err){
    console.log('buyNextStep3 ERROR: ' + err);
    var result = {status: 'fail'};
    return res.json(result);
  }
};

// not yet done!
const buyNextStep4 = async (req, res) =>{
  try{
    var querytext = `
    WITH users AS(
      SELECT id FROM users
      WHERE nickname = $1
    )
    UPDATE temp_user_bid
    SET phone_color=$2, phone_capacity=$3 
    FROM users
    WHERE temp_user_bid.user_id = users.id`;
    const {nickname, phone_color, phone_capacity} = req.body;
    await query(querytext, [nickname, phone_color, phone_capacity]);
    var result = {status: 'success'};
    return res.json(result);
  }
  catch(err){
    console.log('buyNextStep2 ERROR: ' + err);
    var result = {status: 'fail'};
    return res.json(result);
  }
};
module.exports = {
  startBidding,
  buyNextStep1,
  buyNextStep2,
  buyNextStep3,
  buyNextStep4
}
