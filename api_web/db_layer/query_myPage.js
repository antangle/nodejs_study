const Pool = require('../connect/pool');
const define = require('../../definition/define');

const pool = Pool.pool;
const query = Pool.query;

pool.on('error', function (err, client) {
    console.error('idle client error', err.message, err.stack);
});


module.exports = {
    
};
   