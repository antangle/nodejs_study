const {Pool} = require('pg');

var config = {
  user: 'postgres',
  host: 'localhost',
  database: 'aptioncompany', 
  password: 'doqtus3069',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(config);

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