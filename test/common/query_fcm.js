//#region user fcm

const Pool = require('./pool');
const define = require('../../definition/define');

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);  
});

const path = require('path')
const dotenv = require('dotenv');
dotenv.config({path: path.join(__dirname, '/../../.env')});

const getPushTokenByDealId = async(deal_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT push_token
            FROM users
            INNER JOIN deal
                ON deal.id = $1
            WHERE users.id = deal.user_id
        `;
        var {rows, rowCount, errcode} = await query(querytext, [deal_id], -90002);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -90003};
        }
        result = {result: define.const_SUCCESS, push_token: rows[0].push_token};
        return result;
    }
    catch(err){
        result.result = -90001;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const getPushTokenByUserId = async(user_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT push_token
            FROM users
            WHERE id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [user_id], -90004);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -90005};
        }
        else if(rowCount > 1){
            return {result: -90006};
        }
        result = {result: define.const_SUCCESS, push_token: rows[0].push_token};
        return result;
    }
    catch(err){
        result.result = -90007;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};
//#endregion

//#region store fcm
const getAdminPushTokenStore = async()=>{
    var result = {};
    try{
        const querytext = `
            SELECT push_token
            FROM partner
            INNER JOIN store
                ON store.id = $1
            WHERE push_token IS NOT NULL
                AND partner.store_id = store.id
        `;
        const admin_id = process.env.ADMIN_STORE_ID;
        var {rows, rowCount, errcode} = await query(querytext, [admin_id], -90008);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -90009};
        }
        var push_token = [];
        for(var i=0; i<rows.length; ++i){
            push_token.push(rows[i].push_token);
        }
        console.log(push_token);
        result = {result: define.const_SUCCESS, push_token: push_token};
        return result;
    }
    catch(err){
        result.result = -90010;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const getStorePushTokensByDealId = async(deal_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT partner.push_token
            FROM partner
            INNER JOIN deal
                ON deal.id = $1
            WHERE partner.store_id = deal.store_id
                AND partner.push_token IS NOT NULL
        `;
        var {rows, rowCount, errcode} = await query(querytext, [deal_id], -90011);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: -90012};
        }
        var push_tokens = [];
        for(var i=0; i<rows.length; ++i){
            push_tokens.push(rows[i].push_token);
        }
        result = {result: define.const_SUCCESS, push_tokens: push_tokens};
        return result;
    }
    catch(err){
        result.result = -90013;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

module.exports ={
    //user
    getPushTokenByDealId,
    getPushTokenByUserId,
    //store
    getAdminPushTokenStore,
    getStorePushTokensByDealId,
}