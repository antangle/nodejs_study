const Pool = require('../connect/pool');
const define = require('../../definition/define')

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

//store login query(s001~s007)
const getS001GetPassword = async(login_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT id AS store_id, login_pwd AS hash_pwd
            FROM store
            WHERE login_id = $1
        `;
        var {rows} = await query(querytext, [login_id]);
        result ={result: define.const_SUCCESS, data: rows[0]};
    }
    catch(err){
        result.result = -511;
        console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
        return result;
    }
};

const postS003LoginIdCheck = async(login_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT
                COALESCE(
                    (SELECT 1 FROM store 
                    WHERE login_id = $1), -2) AS match
                    `;
        var {rows} = await query(querytext, [login_id]);
        result ={result: define.const_SUCCESS, match: rows[0].match};
    }
    catch(err){
        result.result = -531;
        console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
        return result;
    }
};
const postS003IdPassword = async(login_id, hash_pwd)=>{
    var result = {};
    try{
        const querytext = `
            INSERT INTO store(id, login_id, login_pwd)
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
        result ={result: define.const_SUCCESS, store_id: rows[0].id};
    }
    catch(err){
        result.result = -532;
        console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
        return result;
    }
}

const postS004StoreInfo = async(postArray)=>{
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
            create_time = current_date
            WHERE store.id = $7
            `;
            console.log(postArray)
        await query(querytext, postArray);
        result ={result: define.const_SUCCESS};
    }
    catch(err){
        result.result = -541;
        console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
        return result;
    }
}


const posts007LocationCode = async(sido_code, sgg_code, store_id)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE store SET
            sido_code = $1,
            sgg_code = $2
            WHERE id = $3
            `;
        await query(querytext, [sido_code, sgg_code, store_id]);
        result ={result: define.const_SUCCESS};
    }
    catch(err){
        result.result = -573;
        console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
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
        var {rows} = await query(querytext, [login_id]);
        result ={result: define.const_SUCCESS, data: rows[0]};
    }
    catch(err){
        result.result = -11;
        console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
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
        result ={result: define.const_SUCCESS, match: rows[0].match};
    }
    catch(err){
        result.result = -41;
        console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
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
        result ={result: define.const_SUCCESS, user_id: rows[0].id};
    }
    catch(err){
        result.result = -42;
        console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
        return result;
    }
}
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
    }
    catch(err){
        result.result = -61;
        console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
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
    }
    catch(err){
        result.result = -62;
        console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
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
    }
    catch(err){
        result.result = -71;
        console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
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
    }
    catch(err){
        result.result = -72;
        console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
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
        await query(querytext, [sido_code, sgg_code, user_id]);
        result ={result: define.const_SUCCESS};
    }
    catch(err){
        result.result = -73;
        console.log(`ERROR: ${result.result}/` + err);
    }
    finally{
        return result;
    }
}
module.exports = {
    //store login query
    getS001GetPassword,
    postS003LoginIdCheck,
    postS003IdPassword,
    postS004StoreInfo,
    posts007LocationCode,
    
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
};
