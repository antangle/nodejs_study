const Pool = require('./pool');
const define = require('../../definition/define');

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

//partner login query(P001~P007)
const getP001GetPassword = async(login_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT id AS partner_id, login_pwd AS hash_pwd
            FROM partner
            WHERE login_id = $1
        `;
        var {rows} = await query(querytext, [login_id]);
        result = {result: define.const_SUCCESS, data: rows[0]};
        return result;
    }
    catch(err){
        result.result = -511;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};
const postP004LoginIdCheck = async(login_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT
                COALESCE(
                    (SELECT 1 FROM partner 
                    WHERE login_id = $1), -2) AS match
                    `;
        var {rows} = await query(querytext, [login_id]);
        result = {result: define.const_SUCCESS, match: rows[0].match};
        return result;
    }
    catch(err){
        result.result = -531;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};
const postP004IdPassword = async(login_id, hash_pwd)=>{
    var result = {};
    try{
        const querytext = `
            INSERT INTO partner(id, login_id, login_pwd, state)
            VALUES($1, $2, $3, 1)
            ON CONFLICT (login_id) DO NOTHING
            RETURNING id
            `;
        var strDate = String(Date.now());
        //cut strDate 0.001sec part and change type to Integer
        var date = strDate.substr(0,12)*1;
        var {rows, rowCount} = await query(querytext, [date, login_id, hash_pwd]);
        if(rowCount === 0){
            throw('please do ID check first');
        }
        result ={result: define.const_SUCCESS, partner_id: rows[0].id};
        return result;
    }
    catch(err){
        result.result = -532;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}
const postStoreInfo = async(postArray)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE store SET
            uuid = $1,
            name = $2,
            trade_name = $3,
            phone = $4,
            phone_1 = $5,
            address = $6,
            state = 1,
            region = $7
            create_time = current_date
            WHERE store.partner_id = $8
            `;
        await query(querytext, postArray);
        result ={result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -541;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}
const postP007LocationCode = async(sido_code, sgg_code, partner_id)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE partner SET
            sido_code = $1,
            sgg_code = $2
            WHERE id = $3
            RETURNING id
            `;
        var {rowCount} = await query(querytext, [sido_code, sgg_code, partner_id]);
        if(rowCount === 0){
            return {result:-574, Message: 'given code or partner_id is wrong'}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -573;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}
const PartnerToStore908 = async(partner_id)=>{
    try{
        const querytext = `
            WITH cte AS(
                UPDATE partner SET
                store_id = $1
                WHERE partner.id = $2
            )
            INSERT INTO store(id, partner_id)
            VALUES($1, $2)
            RETURNING id`;
        var strDate = String(Date.now());
        //cut strDate 0.001sec part and change type to Integer
        var store_id = strDate.substr(0,12)*1
        var {rows, rowCount} = await query(querytext, [store_id, partner_id]);
        if(rowCount === 0){
            return {result: -502, Message: '스토어 계정 설립에 문제가 있었습니다'}
        }
        result = {result: define.const_SUCCESS, store_id: rows[0].store_id};
        return result;
    }
    catch(err){
        result.result = -581;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}
// user login query
const get001GetPassword = async(login_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT id AS user_id, login_pwd AS hash_pwd
            FROM users
            WHERE login_id = $1
        `;
        var {rows, rowCount} = await query(querytext, [login_id]);
        if(rowCount !== 1){
            return {result: -12, errMessage: '아이디가 존재하지 않습니다'};
        }
        result = {result: define.const_SUCCESS, data: rows[0]};
        return result;
    }
    catch(err){
        result.result = -11;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};
const post004LoginIdCheck = async(login_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT
                COALESCE(
                    (SELECT 1 FROM users 
                    WHERE login_id = $1), -2) AS match
                    `;
        var {rows} = await query(querytext, [login_id]);
        result = {result: define.const_SUCCESS, match: rows[0].match};
        return result;
    }
    catch(err){
        result.result = -41;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const post004IdPassword = async(login_id, hash_pwd)=>{
    var result = {};
    try{
        const querytext = `
            INSERT INTO users(id, login_id, login_pwd)
            VALUES($1, $2, $3)
            ON CONFLICT (login_id) DO NOTHING
            RETURNING id
            `;
        var strDate = String(Date.now());
        //cut strDate 0.001sec part and change type to Integer
        var date = strDate.substr(0,12)*1
        var {rows, rowCount} = await query(querytext, [date, login_id, hash_pwd]);
        if(rowCount === 0){
            throw('please do ID check first');
        }
        result = {result: define.const_SUCCESS, user_id: rows[0].id};
        return result;
    }
    catch(err){
        result.result = -42;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}
const get005GetPassword = async(login_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT id AS partner_id, login_pwd AS hash_pwd
            FROM partner
            WHERE login_id = $1
        `;
        var {rows} = await query(querytext, [login_id]);
        result = {result: define.const_SUCCESS, data: rows[0]};
        return result;
    }
    catch(err){
        result.result = -511;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};
const post006NicknameCheck = async(nick)=>{
    var result = {};
    try{
        const querytext = `
            SELECT
                COALESCE(
                    (SELECT 1 FROM users 
                    WHERE nick = $1), -2) AS match
                    `;
        var {rows} = await query(querytext, [nick]);
        result ={result: define.const_SUCCESS, match: rows[0].match};
        return result;
    }
    catch(err){
        result.result = -61;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
    
};

const post006Nickname = async(nick, user_id)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE users SET 
            nick = $1,
            create_time = current_date,
            state = 1
            WHERE id = $2
            RETURNING id
            `;
        var {rows, rowCount} = await query(querytext, [nick, user_id]);
        if(rowCount === 0){
            throw('please do nickname overlap check first');
        }
        result ={result: define.const_SUCCESS, user_id: rows[0].id};
        return result;
    }
    catch(err){
        result.result = -62;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
    
}


const get007SdCode = async()=>{
    var result = {};
    try{
        const querytext = `
            SELECT code, name
            FROM location_sd
            `;
        var {rows, rowCount} = await query(querytext, []);
        if(rowCount == 0)
            throw('no info on DB')
        result ={result: define.const_SUCCESS, sd: rows};
        return result;
    }
    catch(err){
        result.result = -71;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
    
}
const get007SggCode = async(sido_code)=>{
    var result = {};
    try{
        const querytext = `
            SELECT code, name 
            FROM location_sgg
            WHERE sido_code = $1
            `;
        var {rows, rowCount} = await query(querytext, [sido_code]);
        if(rowCount == 0)
            throw('no info on DB')
        result ={result: define.const_SUCCESS, sgg: rows};
        return result;
    }
    catch(err){
        result.result = -72;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
    
}
const post007LocationCode = async(sido_code, sgg_code, user_id)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE users SET
            sido_code = $1,
            sgg_code = $2
            WHERE id = $3
            `;
        var {rowCount} = await query(querytext, [sido_code, sgg_code, user_id]);
        if(rowCount !== 1){
            return {result:-74, message: '시/도, 시/군/구가 등록되지 않았습니다'}
        }
        result ={result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -73;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}
const UserUpdateToken008 = async(user_id, token) =>{
    var result = {}
    try{
        const querytext = `
            UPDATE users SET
            push_token = $2
            WHERE id = $1
            `;
        var {rowCount} = await query(querytext, [user_id, token]);
        if(rowCount !== 1){
            return {result:-82, message: '로그인 정보가 일치하지 않아 등록이 불가합니다'}
        }
        result ={result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -81;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

const UserDeleteToken008 = async(user_id) =>{
    var result = {}
    try{
        const querytext = `
            UPDATE users SET
            push_token = NULL
            WHERE id = $1
            `;
        var {rowCount} = await query(querytext, [user_id]);
        if(rowCount !== 1){
            return {result:-84, message: '로그인 정보가 일치하지 않아 등록이 불가합니다'}
        }
        result ={result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -83;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}
const UserShutAccount008 = async(user_id) =>{
    var result = {}
    try{
        const querytext = `
            UPDATE users SET
            state = -1,
            push_token = NULL
            WHERE id = $1
            `;
        var {rowCount} = await query(querytext, [user_id]);
        if(rowCount !== 1){
            return {result:-86, message: '로그인 정보가 일치하지 않아 등록이 불가합니다'}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -85;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}


const PartnerUpdateToken909 = async(partner_id, token) =>{
    var result = {}
    try{
        const querytext = `
            UPDATE partner SET
            push_token = $2
            WHERE id = $1
            `;
        var {rowCount} = await query(querytext, [partner_id, token]);
        if(rowCount !== 1){
            return {result:-582, message: '로그인 정보가 일치하지 않아 등록이 불가합니다'}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -581;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

const PartnerLogout910 = async(partner_id) =>{
    var result = {}
    try{
        const querytext = `
            UPDATE partner SET
            push_token = NULL
            WHERE id = $1
            `;
        var {rowCount} = await query(querytext, [partner_id]);
        if(rowCount !== 1){
            return {result:-584, message: '로그인 정보가 일치하지 않아 등록이 불가합니다'}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -583;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}
const PartnerShutAccount911 = async(partner_id) =>{
    var result = {}
    try{
        const querytext = `
            UPDATE partner SET
            state = -1,
            push_token = NULL
            WHERE id = $1
            `;
        var {rowCount} = await query(querytext, [partner_id]);
        if(rowCount !== 1){
            return {result:-586, message: '로그인 정보가 일치하지 않아 등록이 불가합니다'}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -585;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

module.exports = {
    PartnerToStore908,
    //partner login query
    getP001GetPassword,
    postP004LoginIdCheck,
    postP004IdPassword,
    postP007LocationCode,
    //user login query
    get001GetPassword,
    post004LoginIdCheck,
    post004IdPassword,
    post006NicknameCheck,
    post006Nickname,
    post007LocationCode,
    //both use
    get007SdCode,
    get007SggCode,
    //User logout
    UserUpdateToken008,
    UserDeleteToken008,
    UserShutAccount008,
    //partner logout
    PartnerUpdateToken909,
    PartnerLogout910,
    PartnerShutAccount911
};
