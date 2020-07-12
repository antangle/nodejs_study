const Pool = require('./pool');
const express = require('express');
const querytext = require('./query')
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
    var result = {};
    var {nickname} = req.query;
    var {rows} = await query(querytext.getSelectedPhoneQuery, [nickname]);
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
    var {rows} = await query(querytext.getPhonesFromDBQuery, []);
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
    
    const phone_brand = req.query.phone_brand;
    var {rows} = await query(querytext.getPhonesByCompanyquery, [phone_brand]);    
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
    console.log(selected);
    var phone_name = selected[0].phone_name;
    var result = {data: selected};
    console.log(result);
    var {rows} = await query(querytext.getColorQuery, [phone_name]);    
    result.color = rows;
    var {rows} = await query(querytext.getCapacityQuery, [phone_name]);    
    result.capacity = rows;
    result.status = 'success'
    console.log(result);
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
