const {Pool} = require('pg');
const path = require('path')
const dotenv = require('dotenv');
dotenv.config({path: path.join(__dirname, '../../.env')});

var db_config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB, 
  password: process.env.DB_PWD,
  port: process.env.DB_PORT,
  max: 10,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(db_config);

async function query (queryText, params) {
    const client = await pool.connect();
    let res;
    try {
      await client.query('BEGIN');
      try {
        res = await client.query(queryText, params);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.log('query ERROR: ' +err);
      }
    } catch(error){
        console.log('error in query function: ' + error);
    } finally{
      client.release();
    };
    return res;
}

module.exports= {
    pool: pool,
    query: query,
  };