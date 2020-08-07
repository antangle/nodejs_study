const Pool = require('./pool');
const define = require('../../definition/define');

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

//#region user login
const getU001GetPassword = async(login_id)=>{
    var result = {};
    try{
        const querytext = `
        SELECT id AS user_id, login_pwd AS hash_pwd, nick, sgg_code, state
        FROM users
        WHERE login_id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [login_id], -9212);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount < 1){
            return {result: 9213};
        }
        else if(rowCount > 1){
            return {result: -9214};
        }
        result = {result: define.const_SUCCESS, data: rows[0]};
        return result;
    }
    catch(err){
        result.result = -9213;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const checkDupinfoUser = async(dupinfo) => {
    var result = {};
    try{
        const querytext = `
        SELECT 1 FROM users
        WHERE dupinfo = $1
        AND state != -1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [dupinfo], -92232);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            return {result: 1};
        }
        if(rowCount === 1){
            return {result: 92231};    
        }
        if(rowcount > 1){
            return {result:-92234}
        }
        return result;
    }
    catch(err){
        result.result = -92231;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}
const postU004LoginIdCheck = async(login_id)=>{
    var result = {};
    try{
        //9231: 중복 있음. 1, 중복 없음
        const querytext = `
            SELECT
                COALESCE(
                    (SELECT 9231 FROM users 
                    WHERE login_id = $1), 1) AS match
                    `;
        var {rows, rowCount, errcode} = await query(querytext, [login_id], -9232);
        if(errcode){
            return {result: -errcode}
        }
        if(rowCount > 1){
            return {result: -9234}
        }
        else if(rowCount <1){
            return {result: -9235}
        }
        result = {result: rows[0].match};
        return result;
    }
    catch(err){
        result.result = -9233;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const postU004IdPassword = async(login_id, hash_pwd, decode)=>{
    var result = {};
    try{
        const querytext = `
            INSERT INTO users(
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
        var {rows, rowCount, errcode} = await query(querytext, paramArray, -9242);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount > 1){
            return {result: -9245}
        }
        else if(rowCount < 1){
            return {result: -9246}
        }
        result = {result: define.const_SUCCESS, user_id: rows[0].id};
        return result;
    }
    catch(err){
        result.result = -9244;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

const post006NicknameCheck = async(nick)=>{
    var result = {};
    try{
        const querytext = `
            SELECT
                COALESCE(
                    (SELECT 92611 FROM users
                    WHERE nick = $1), 1
                ) AS match
        `;
        var {rows, rowCount, errcode} = await query(querytext, [nick], -92612);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount > 1){
            return {result: -92613};
        }
        else if(rowCount < 1){
            return {result: -92614};
        }
        result = {result: rows[0].match};
        return result;
    }
    catch(err){
        result.result = -92611;
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
            `;
        var {rows, rowCount, errcode} = await query(querytext, [nick, user_id], -92622);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount > 1){
            return {result: -92623};
        }
        else if(rowCount < 1){
            return {result: -92624};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -92621;
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
            ORDER BY code ASC
            `;
        var {rows, rowCount, errcode} = await query(querytext, [], -92702);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount < 1){
            return {result: -92703}
        }
        result = {result: define.const_SUCCESS, sd: rows};
        return result;
    }
    catch(err){
        result.result = -92701;
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
            ORDER BY code ASC
            `;
        var {rows, rowCount, errcode} = await query(querytext, [sido_code], -92712);
        if(errcode){
            return {result: errcode}
        }
        if(rowCount <1){
            return {result: -92714}
        }
        result ={result: define.const_SUCCESS, sgg: rows};
        return result;
    }
    catch(err){
        result.result = -92713;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const postU007LocationCode = async(sido_code, sgg_code, user_id)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE users SET
            sido_code = $1,
            sgg_code = $2
            WHERE id = $3
            `;
        var {rowCount, errcode} = await query(querytext, [sido_code, sgg_code, user_id], -92723);
        if(errcode){
            return {result: errcode}
        }
        if(rowCount > 1){
            return {result: -92724}
        }
        else if(rowCount <1){
            return {result: -92725}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -92722;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

const checkUserState910 = async(user_id) =>{
    var result = {};
    try{
        const querytext = `
            SELECT state, id AS user_id 
            nick, sgg_code
            FROM users
            WHERE id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [user_id], -9302);
        if(errcode){ 
            return {result: errcode};
        }
        if(rowCount < 1){
            return {result: -9303};
        }
        else if(rowCount > 1){
            return {result: -9304};    
        }
        result = {
            result: define.const_SUCCESS, 
            state: rows[0].state,
            user_id: rows[0].user_id
        };
        return result;
    }
    catch(err){
        result.result = -9301;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

const updatePushTokenUser = async(login_id, push_token)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE users SET
            push_token = $2
            WHERE login_id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [login_id, push_token], -9216);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount > 1){
            return {result: -9217};
        }
        else if(rowCount < 1){
            return {result: -9218};
        }
        result.result = define.const_SUCCESS;
        return result;
    }
    catch(err){
        result.result = -9213;
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
const getP001GetPassword = async(login_id)=>{
    var result = {};
    try{
        const querytext = `
            SELECT id AS partner_id, login_pwd AS hash_pwd, store_id, state
            FROM partner
            WHERE login_id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [login_id], -9012);
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
            AND state != -1
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
        result.result = -9043;
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

const StoreTempInsert908 = async(store_info)=>{
    try{
        const querytext = `
            INSERT INTO store_temp(
                partner_id, uuid, 
                name, trade_name, 
                phone, phone_1, 
                address, state,
                region, update_time
            )
            SELECT
                $1, $2,
                $3, $4,
                $5, $6,
                $7, 2,
                $8, current_timestamp
            RETURNING state
        `;
        /*
        sgg.name
            
        INNER JOIN location_sgg AS sgg
        ON partner.id = $2
        AND sgg.code = partner.sgg_code
        */  
        //TODO: region 만들기
        var region = '가게';
        var paramArray = [
            store_info.partner_id, store_info.uuid, 
            store_info.name, store_info.trade_name, 
            store_info.phone, store_info.phone_1, 
            store_info.address, region
        ];
        var {rows, rowCount, errcode} = await query(querytext, paramArray, -90812);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount > 1){
            return {result: -90813};
        }
        else if(rowCount < 1){
            return {result: -90814};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -90811;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

const updatePartnerMakeMeStore = async(partner_id)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE partner SET
            state = 2,
            store_id = null,
            update_time = current_timestamp
            WHERE id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [partner_id], -90815);
        if(errcode){
            return {result: errcode}
        }
        if(rowCount > 1){
            return {result: -90816}
        }
        else if(rowCount < 1){
            return {result: -90817}
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -90811;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

const storeAcceptCheckUUID = async(partner_id) => {
    try{
        const querytext = `
            SELECT store.id FROM store
            INNER JOIN store_temp AS temp
            ON temp.partner_id = $1
            AND store.uuid = temp.uuid
        `;
        var {rows, rowCount, errcode} = await query(querytext, [partner_id], -90902);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount === 0){
            //uuid 중복 없음
            return {result: define.const_SUCCESS};
        }
        else if (rowCount === 1){
            //uuid 중복 있음
            return {result: 2, store_id: rows[0].id};
        }
        else if(rowCount > 1){
            return {result: -90903};
        }
        return {result: -90904};
    }
    catch(err){
        result.result = -90901;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

const storeAcceptInsertStore = async(partner_id) => {
    try{
        const querytext = `
            INSERT INTO store(
                id,  
                uuid, name, 
                trade_name, phone, 
                phone_1, address, 
                state, region, 
                update_time
            )
            SELECT $1, 
            uuid, name,
            trade_name, phone,
            phone_1, address,
            1, region,
            current_timestamp
            FROM store_temp AS temp
            WHERE partner_id = $2
            RETURNING id
        `;
        var strDate = String(Date.now());
        //cut strDate 0.001sec part and change type to Integer
        var store_id = strDate.substr(0,12);

        var {rows, rowCount, errcode} = await query(querytext, [store_id, partner_id], -90905);
        if(errcode){
            return {result: errcode};
        }
        if (rowCount > 1){
            return {result: -90906};
        }
        else if(rowCount < 1){
            return {result: -90907};
        }
        result = {result: define.const_SUCCESS, store_id: rows[0].id};
        return result;
    }
    catch(err){
        result.result = -90901;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

const storeAcceptUpdateStoreTemp = async(partner_id) => {
    try{
        const querytext = `
            UPDATE store_temp SET
            update_time = current_timestamp,
            state = 1
            WHERE partner_id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [partner_id], -90908);
        if(errcode){
            return {result: errcode};
        }
        if (rowCount > 1){
            return {result: -90909};
        }
        else if(rowCount < 1){
            return {result: -90910};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -90901;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

const storeAcceptUpdatePartner = async(store_id ,partner_id) => {
    try{
        const querytext = `
            UPDATE partner SET
            store_id = $1,
            update_time = current_timestamp,
            state = 1
            WHERE id = $2
            RETURNING store_id
        `;

        var {rows, rowCount, errcode} = await query(querytext, [store_id, partner_id], -90911);
        if(errcode){
            return {result: errcode};
        }
        if (rowCount > 1){
            return {result: -90912};
        }
        else if(rowCount < 1){
            return {result: -90913};
        }
        result = {result: define.const_SUCCESS, store_id: rows[0].store_id};
        return result;
    }
    catch(err){
        result.result = -90901;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

const storeDenyUpdateStoreTemp = async(partner_id) => {
    try{
        const querytext = `
            UPDATE store_temp SET
            state = 3,
            update_time = current_timestamp
            WHERE partner_id = $1
        `;

        var {rows, rowCount, errcode} = await query(querytext, [partner_id], -90922);
        if(errcode){
            return {result: errcode};
        }
        if (rowCount > 1){
            return {result: -90923};
        }
        else if(rowCount < 1){
            return {result: -90924};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        result.result = -90921;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

const storeDenyUpdatePartner = async(partner_id) => {
    try{
        const querytext = `
            UPDATE partner SET
            state = 4,
            update_time = current_timestamp
            WHERE id = $1
        `;
        var strDate = String(Date.now());
        //cut strDate 0.001sec part and change type to Integer
        var store_id = strDate.substr(0,12);

        var {rows, rowCount, errcode} = await query(querytext, [partner_id], -9092);
        if(errcode){
            return {result: errcode};
        }
        if(rowCount < 1){
            return {result: -9080};
        }
        else if (rowCount > 1){
            return {result: 9091};
        }
        result = {result: define.const_SUCCESS, store_id: rows[0].id};
        return result;
    }
    catch(err){
        result.result = -9091;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
}

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

const updatePushTokenPartner = async(login_id, push_token)=>{
    var result = {};
    try{
        const querytext = `
            UPDATE partner SET
            push_token = $2
            WHERE login_id = $1
        `;
        var {rows, rowCount, errcode} = await query(querytext, [login_id, push_token], -9016);
            //-9047
        if(errcode){
            return {result: errcode};
        }
        if(rowCount > 1){
            //-9048
            return {result: -9017};
        }
        else if(rowCount < 1){
            //-9049
            return {result: -9018};
        }
        result = {result: define.const_SUCCESS};
        return result;
    }
    catch(err){
        //-9042
        result.result = -9011;
        console.log(`ERROR: ${result.result}/` + err);
        return result;
    }
};

//사용 안할거

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
    getU001GetPassword,
    checkDupinfoUser,
    postU004LoginIdCheck,
    postU004IdPassword,
    post006NicknameCheck,
    post006Nickname,
    postU007LocationCode,
    //both use
    get007SdCode,
    get007SggCode,
    //User logout
    UserUpdateToken008,
    UserDeleteToken008,
    UserShutAccount008,
    updatePushTokenUser,
    checkUserState910,

    //partner login query
    getP001GetPassword,
    checkDupinfoPartner,
    postP004LoginIdCheck,
    postP004IdPassword,
    postP007LocationCode,
    //parter becoming store
    StoreTempInsert908,
    updatePartnerMakeMeStore,
    storeAcceptCheckUUID,
    storeAcceptInsertStore,
    storeAcceptUpdateStoreTemp,
    storeAcceptUpdatePartner,
    storeDenyUpdateStoreTemp,
    storeDenyUpdatePartner,
    checkState910,

    updatePushTokenPartner,
    PartnerUpdateToken909,
    //partner logout
    PartnerLogout910,
    //partner shut account
    PartnerShutAccount911,
    test,
};
