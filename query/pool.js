const {Pool} = require('pg');

var config = {
  user: 'postgres',
  host: '54.180.116.190',
  database: 'test', 
  password: '',
  port: 5432,
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