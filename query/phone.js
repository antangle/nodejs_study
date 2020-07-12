const Pool = require('./pool');
const express = require('express');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: false }));

const pool = Pool.pool;
const query = Pool.query;
pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

const getSelectedPhone = async (req) =>{
  try{
    var querytext =`
    WITH yourid AS(
      SELECT id FROM users
      WHERE nickname = $1
    )
    SELECT temp.phone_name, temp.phone_company, (
      SELECT img 
      FROM phone, temp_user_bid AS temp
      WHERE phone.phone_name = temp.phone_name
    )
    FROM temp_user_bid AS temp, yourid
    WHERE temp.user_id = yourid.id
    `
    ;
    var result = {}
    var {nickname} = req.query;
    var {rows} = await query(querytext, [nickname]);
    result = {data: rows}
    if(rows.length == 0)
      result.isSelected = 'FALSE';
    else
      result.isSelected = 'TRUE';
    return result;
  }
  catch(err){
    console.log('getSelectedPhone ERROR: ' + err);
    result = {status: 'fail'}
    return result;
  }
}

//ORDER BY RELEASE DATE not yet coded
const getPhonesFromDB = async (req, res) =>{
  try{
    var selected;
    //먼저 temp_user_bid 확인
    const a = await getSelectedPhone(req).then(value =>{
      selected = value;
    });
    var querytext =`
    SELECT phone_name, phone_company, img
    FROM phone 
    WHERE ishot = TRUE
    ORDER BY id DESC
    LIMIT 6
    `;
    var {rows} = await query(querytext, []);
    var result = selected;
    
    //temp_user_bid에 내용이 있으면 TRUE
    if(selected.isSelected == 'TRUE'){
      for(i=0;i<rows.length;++i){
        if(result.data[0].phone_name === rows[i].phone_name){
          continue;
        }
        else if(result.data.length == 6)
          break;
        else{
          result.data.push(rows[i])
        }
      }
    }
    else
      result.data = rows;
    result.status = 'success';
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
    const phone_company = req.query.phone_company;
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
    var selected;
    //먼저 temp_user_bid 확인
    const a = await getSelectedPhone(req).then(value =>{
      selected = value.data;
    });
    var getColorQuery =`
    WITH phone AS(
      SELECT id FROM phone
      WHERE phone_name = $1
    )
    SELECT clr.color, clr.color_code FROM phone_color clr, phone
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
    var phone_name = selected[0].phone_name
    var result = {data: selected}
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
