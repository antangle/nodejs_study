var express = require('express');
var router = express.Router();
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: false }));

const Pool = require('../query/pool');
const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

router.get('/', async (req, res)=>{
    try{
        var querytext = `
        SELECT (name, phone_num, email, is_auth) FROM landing_user_list
        `
        var {rows} = await query(querytext, []);
        var result = {status: 'success', data: rows}
        res.json(result)
    }
    catch(err){
        console.log('GetlandingUserList ERROR: ' + err);
        result = {status: 'fail'}
        return result;
    }
});;

router.post('/', async (req, res)=>{
    try{
        var {name, phone_num, email, is_auth} = req.body
        
        if(is_auth === undefined){
            is_auth = false;
        };
        
        querytext = `
        WITH cte AS(
        INSERT INTO landing_user_list(name, phone_num, email, is_auth)
        VALUES($1, $2, $3, $4)
        ON CONFLICT (phone_num) DO NOTHING
        RETURNING phone_num
        )
        SELECT NULL AS conflict 
        WHERE EXISTS(SELECT 1 FROM cte)
        UNION ALL
        SELECT $2 AS conflict
        WHERE NOT EXISTS (SELECT 1 FROM cte)
        `;
        var {rows} = await query(querytext, [name, phone_num, email, is_auth]) 
        var isoverlap = rows[0].conflict;
        if(isoverlap == null){
            var result = {status: 'success'};
        }
        else{
            var result = {status: 'overlap'};
        }    
        return res.json(result);
    }
    catch(err){
        console.log('PostLandingUserList ERROR: ' + err);
        result = {status: 'fail'}
        return result;
    }
});
module.exports = router;
