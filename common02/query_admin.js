//#region admin query

const Pool = require('./pool');
const define = require('../definition/define');

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);  
});

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({path: path.join(__dirname, '../.env')});

const getAllUserHelp = async()=>{
    var result = {};
    try{
        const querytext = `
            SELECT 
                users.id, users.phone, 
                help.comment, help.create_date,
                help.state
            FROM help_user AS help
            INNER JOIN users
                ON users.id = help.user_id
            ORDER BY help.create_date DESC
        `;
        var {rows, rowCount, errcode} = await query(querytext, [], -10002);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -10003};
        }
        result = {result: define.const_SUCCESS, data: rows};
        return result;
    }
    catch(err){
        result.result = -10001;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const getAllStoreHelp = async()=>{
    var result = {};
    try{
        const querytext = `
            SELECT 
                store.id, users.phone, 
                help.comment, help.create_date,
                help.state
            FROM help_store AS help
            INNER JOIN store
                ON store.id = help.store_id
            ORDER BY help.create_date DESC
        `;
        var {rows, rowCount, errcode} = await query(querytext, [], -10002);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -10003};
        }
        result = {result: define.const_SUCCESS, data: rows};
        return result;
    }
    catch(err){
        result.result = -10001;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

module.exports ={
    getPushTokenByDealId,
}