const Pool = require('./pool');
const express = require('express');
const pool = Pool.pool;
const query = Pool.query;
pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

const getSelectedPhone = async (req, res) =>{
  try{
    var querytext =`
    WITH yourid AS(
      SELECT id FROM users
      WHERE nickname = $1
    )
    SELECT temp.phone_name, temp.phone_company
    FROM temp_user_bid AS temp, yourid
    WHERE temp.user_id = yourid.id
    `;
    var result = {}
    var {nickname} = req.query;
    var {rows} = await query(querytext, [nickname]);
    console.log(rows.length);
    if(rows.length == 0)
      result.status = "Non exsiting User";
    else if(rows[0].phone_name == null){
      result.status = "Not Selected Yet"
    }
    else{
      result = {status: 'success', data: rows}
    }
    return res.json(result);
  }
  catch(err){
    console.log('getSelectedPhone ERROR: ' + err);
    result = {status: 'fail'}
    return res.json(result)
  }
}

//ORDER BY RELEASE DATE not yet coded
const getPhonesFromDB = async (req, res) =>{
  try{
    var querytext =`
    SELECT phone_name, phone_company, img
    FROM phone 
    ORDER BY img DESC
    LIMIT 6
    `;
    var {rows} = await query(querytext, []);        
    var result = {status: 'success', data: rows}
    return res.json(result);
  }
  catch(err){
    console.log('getPhonesFromDB ERROR: ' + err);
    var result = {status: 'fail'}
    return res.json(result)
  }
}

const getPhonesByCompany = async(req, res) =>{
  try{
    var querytext =`
    SELECT phone_name, phone_company, img
    FROM phone 
    WHERE phone_company = $1`;
    const {phone_company} = req.query;
    var {rows} = await query(querytext, [phone_company]);    
    var result = {status: 'success', data: rows}
    return res.json(result);
  }
  catch(err){
    console.log('getPhonesByCompany ERROR: ' + err);
    var result = {status: 'fail'}
    return res.json(result)
  }
}

const getColorCapacityByPhone = async(req, res) =>{
  try{
    var getColorQuery =`
    WITH phone AS(
      SELECT id FROM phone
      WHERE phone_name = $1
    )
    SELECT clr.color FROM phone_color clr, phone
    WHERE phone.id = clr.phone_id
    `;
    var getCapacityQuery =`
    WITH phone AS(
      SELECT id FROM phone
      WHERE phone_name = $1
    )
    SELECT cap.capacity FROM phone_capacity cap, phone
    WHERE phone.id = cap.phone_id
    `;
    const {phone_name} = req.query;
    var result = {}
    var {rows} = await query(getColorQuery, [phone_name]);    
    result.color = rows;
    var {rows} = await query(getCapacityQuery, [phone_name]);    
    result.capacity = rows;
    result.status = 'success'
    return res.json(result);
  }
  catch(err){
    console.log('getPhonesColorCapacity ERROR: ' + err);
    var result = {status: 'fail'}
    return res.json(result)
  }
}

module.exports = {
  getSelectedPhone,
  getPhonesFromDB,
  getPhonesByCompany,
  getColorCapacityByPhone,
}
