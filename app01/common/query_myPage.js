const Pool = require('./pool');
const define = require('../../definition/define');

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
    console.error('idle client error', err.message, err.stack);
});

const myPageNeededInfo401 = async(user_id)=>{
    var result = {};
    try{
      const querytext = `
      SELECT users.nick
      FROM users
      LEFT JOIN auction_temp AS temp
      ON temp.user_id = $1
      WHERE users.id = $1
    `;
      var {rows, rowCount, errcode} = await query(querytext, [user_id], -4012);
      if(errcode){
          return {result: errcode}  
      }
      if(rowCount !== 1){
          return {result: -4012}
      }
      result.nick = rows[0].nick
      result.result = define.const_SUCCESS;
      return result;
    }
    catch(err){
      result.result = -4011;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

const myPageHelp402 = async(user_id, type, comment)=>{
    var result = {};
    try{
      const querytext = `
      INSERT INTO help(user_id, type, comment)
      VALUES($1, $2, $3)
    `;
      var {rows, rowCount, errcode} = await query(querytext, [user_id, type, comment], -4012);
      if(errcode){
          return {result: errcode}  
      }
      if(rowCount !== 1){
          return {result: -4012}
      }
      result.nick = rows[0].nick
      result.result = define.const_SUCCESS;
      return result;
    }
    catch(err){
      result.result = -4011;
      console.log(`ERROR: ${result.result}/` + err);
      return result;
    }
};

module.exports = {
    myPageNeededInfo401,
    myPageHelp402
};