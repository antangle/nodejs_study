const Pool = require('./pool');
const define = require('../../definition/define');

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

//partner login query(P001~P007)

//#region user

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
            INSERT INTO users(id, login_id, login_pwd, hidden_login_id)
            VALUES($1, $2, $3, $4)
            ON CONFLICT (login_id) DO NOTHING
            RETURNING id
            `;
        var strDate = String(Date.now());
        //cut strDate 0.001sec part
        var date = strDate.substr(0,12);
        var hidden_id = strDate.substr(0,2) + '*****';
        var {rows, rowCount} = await query(querytext, [date, login_id, hash_pwd, hidden_id]);
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
};

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
};

const get007SdCode = async()=>{
    var result = {};
    try{
        const querytext = `
            SELECT code, name
            FROM location_sd
            `;
        var {rows, rowCount, errcode} = await query(querytext, [], -90702);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount < 1){
            return {result: -90703}
        }
        result = {result: define.const_SUCCESS, sd: rows};
        return result;
    }
    catch(err){
        result.result = -90701;
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
        var {rows, rowCount, errcode} = await query(querytext, [sido_code], -90712);
        if(errcode){
            return {result: errcode}
        }
        if(rowCount <1){
            return {result: -90714}
        }
        result ={result: define.const_SUCCESS, sgg: rows};
        return result;
    }
    catch(err){
        result.result = -90713;
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
        var {rowCount} = await query(querytext, [sido_code, sgg_code, user_id], -90793);
        if(rowCount < 1){
            return {result: -9078}
            //존재하지 않는 sido, sgg code
        }
        else if(rowCount > 1){
            return {result: -9079}
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
};

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
};

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
};
//#endregion

//#region store
const getP001GetPassword = async(login_id, push_token)=>{
    var result = {};
    try{
        const querytext = `
        WITH cte AS(
            UPDATE partner SET
            push_token = $2
        )
        SELECT id AS partner_id, login_pwd AS hash_pwd, store_id, state
        FROM partner
        WHERE login_id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [login_id, push_token], -9012);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount < 1){
            return {result: 9013};
        }
        else if(rowCount > 1){
            return {result: -9014};    
        }
        result = {result: define.const_SUCCESS, data: rows[0]};
        return result;
    }
    catch(err){
        result.result = -9013;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};
const checkDupinfoPartner = async(dupinfo) => {
    var result = {};
    try{
        const querytext = `
        SELECT 1 FROM partner
        WHERE dupinfo = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [dupinfo], -90232);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: 1};
        }
        if(rowCount === 1){
            return {result: 90231};    
        }
        if(rowcount > 1){
            return {result:-90234}
        }
        return result;
    }
    catch(err){
        result.result = -90231;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}
const postP004LoginIdCheck = async(login_id)=>{
    var result = {};
    try{
        //9031: 중복 있음. 1, 중복 없음
        const querytext = `
            SELECT
                COALESCE(
                    (SELECT 9031 FROM partner 
                    WHERE login_id = $1), 1) AS match
                    `;
        var {rows, rowCount, errcode} = await query(querytext, [login_id], -9032);
        if(errcode){
            return {result: -errcode}
        }
        if(rowCount > 1){
            return {result: -9034}
        }
        else if(rowCount <1){
            return {result: -9035}
        }
        result = {result: rows[0].match};
        return result;
    }
    catch(err){
        result.result = -9033;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const postP004IdPassword = async(login_id, hash_pwd, decode)=>{
    var result = {};
    try{
        const querytext = `
            INSERT INTO partner(
                id, login_id, 
                login_pwd, name, 
                phone, birth, 
                state, term,
                create_time, dupinfo
            )
            VALUES(
                $1, $2,
                $3, $4,
                $5, $6,
                3, 1,
                current_timestamp, $7
            )
            ON CONFLICT (login_id) DO NOTHING
            RETURNING id
            `;
        var strDate = String(Date.now());
        //cut strDate 0.001sec part and change type to Integer
        var id = strDate.substr(0,12);

        var paramArray = [
            id,
            login_id,
            hash_pwd,
            decode.name,
            decode.mobileno,
            decode.birthdate,
            decode.dupinfo
        ];
        var {rows, rowCount, errcode} = await query(querytext, paramArray, -9042);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount > 1){
            return {result: -9045}
        }
        else if(rowCount <1){
            return {result: -9046}
        }
        result ={result: define.const_SUCCESS, partner_id: rows[0].id};
        return result;
    }
    catch(err){
        result.result = -9044;
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
        result.result = -9051;
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
            `;
        var {rowCount, errcode} = await query(querytext, [sido_code, sgg_code, partner_id], -90723);
        if(errcode){
            return {result: errcode}
        }
        if(rowCount > 1){
            return {result: -90724}
        }
        else if(rowCount <1){
            return {result: -90725}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -90722;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

const makeMeStore908 = async(store_info)=>{
    try{
        const querytext = `
            WITH cte AS(
                UPDATE partner SET
                store_id = $1,
                state = 2
                WHERE partner.id = $2
            )
            INSERT INTO store(
                id, partner_id, 
                uuid, name,
                trade_name, phone,
                phone_1, address,
                state,
                create_time, score,
                score_sum, score_weight,
                region
            )
            SELECT
                $1, $2,
                $3, $4,
                $5, $6,
                $7, $8,
                -2,
                current_timestamp, 0,
                0, 0,
                9999
            FROM partner
            RETURNING id AS store_id
        `;
        /*
        sgg.name
            
        INNER JOIN location_sgg AS sgg
        ON partner.id = $2
        AND sgg.code = partner.sgg_code
        */  
        //여기서 store_id 줘야되나???? 필요없지 않나?
        var strDate = String(Date.now());
        //cut strDate 0.001sec part and change type to Integer
        var store_id = strDate.substr(0,12);
        var paramArray = [
            store_id, store_info.partner_id,
            store_info.uuid, store_info.name,
            store_info.trade_name, store_info.phone,
            store_info.phone_1, store_info.address
        ];
        var {rows, rowCount, errcode} = await query(querytext, paramArray, -9082);
        if(errcode){
            return {result: errcode}
        }
        if(rowCount > 1){
            return {result: -9084}
        }
        else if(rowCount <1){
            return {result: -9085}
        }
        console.log(rows);
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -9081;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const PartnerToStore909 = async(partner_id)=>{
    try{
        const querytext = `
            WITH cte AS(
                UPDATE store SET
                state = 1
            )
            UPDATE partner SET
            store_id = store.id,
            state = 1
            FROM store
            WHERE partner.id = $1
            AND store.partner_id = $1
            RETURNING store_id
        `;
       
        var {rows, rowCount, errcode} = await query(querytext, [partner_id], -9092);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount < 1){
            return {result: -9093};
        }
        else if (rowCount > 1){
            return {result: -9094};
        }
        result = {result: define.const_SUCCESS, store_id: rows[0].store_id};
        return result;
    }
    catch(err){
        result.result = -9091;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const checkState910 = async(partner_id) =>{
    var result = {};
    try{
        const querytext = `
        SELECT state, id AS partner_id, store_id FROM partner
        WHERE id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [partner_id], -9102);
        if(errcode){ 
            return {result: errcode};
        }
        if(rowCount < 1){
            return {result: -9103};
        }
        else if(rowCount > 1){
            return {result: -9104};    
        }
        result = {
            result: define.const_SUCCESS, 
            state: rows[0].state,
            partner_id: rows[0].partner_id,
            store_id: rows[0].store_id
        };
        return result;
    }
    catch(err){
        result.result = -9101;
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
            return {result:-9092, message: '로그인 정보가 일치하지 않아 등록이 불가합니다'}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -9091;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

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
            return {result:-9102, message: '로그인 정보가 일치하지 않아 등록이 불가합니다'}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -9101;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

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
            return {result:-9112}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -9111;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updatePushTokenPartner = async(login_id, device_token)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE partner SET
            push_token = $2
            WHERE login_id = $1
        `;
        var {rows, rowCount} = await query(querytext, [login_id, device_token]);
        console.log(rowCount);
        if(rowCount !== 1){
            return {result: -9000}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -9000;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updatePushTokenStore = async(login_id, device_token)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE store SET
            push_token = $2
            WHERE login_id = $1
        `;
        var {rows, rowCount} = await query(querytext, [login_id, device_token]);
        console.log(rowCount);
        if(rowCount !== 1){
            return {result: -9000}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -9000;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const whoSaidMakeMeStore = async()=>{
    var result = {};
    try{
        const querytext = `
            SELECT id AS partner_id
            FROM partner
            WHERE state = 2
        `;
        var {rows, rowCount} = await query(querytext, []);
        console.log(rowCount);
        if(rowCount !== 1){
            return {result: -9000}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -9000;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const test = async(partner_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT name
            FROM partner
            WHERE partner.id = $1
        `;
        var {rows, rowCount} = await query(querytext, [partner_id]);
        if(rowCount !== 1){
            return {result: -9000}
        }
        result = {result: define.const_SUCCESS, name: rows[0].name};
        return result;
    }
    catch(err){
        result.result = -9000;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};
//#endregion
module.exports = {
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
    //partner login query
    getP001GetPassword,
    checkDupinfoPartner,
    postP004LoginIdCheck,
    postP004IdPassword,
    postP007LocationCode,
    //parter becoming store
    makeMeStore908,
    PartnerToStore909,
    updatePushTokenPartner,
    updatePushTokenStore,
    PartnerUpdateToken909,
    //partner logout
    PartnerLogout910,
    //partner shut account
    PartnerShutAccount911,
    checkState910,
    test,
};
