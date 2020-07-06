const {Pool} = require('pg')
const pool = new Pool({
  "user": 'postgres',
  "host": 'localhost',
  "database": 'phone', 
  "password": 'lawrence',
  "port": 5432,
  'idleTimeoutMillis': 20000,
  'connectionTimeoutMillis': 2000,
})
pool.on('error', (err, client) => {
  console.error('Error:', err);
});

const getPhones = (req, res) =>{
  pool.query(`SELECT (phone_name) FROM phones`, (error, results) => {
    try{
    res.json(results.rows).status(200)
  }
    catch{
      console.log(error)
      return ;
    }
  })
}
const createPhones = (request, response) => {
  const { phone_name, phone_company, cost } = request.body

  pool.query('INSERT INTO phones (phone_name, phone_company, cost) VALUES ($1, $2, $3)', 
  [phone_name, phone_company, cost], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`phone added with ID: ${result.insertId}`)
  })
}

const updatePhones = (request, response) => {
  const id = parseInt(request.params.id)
  const { phone_name, phone_company, cost } = request.body

  pool.query(
    'UPDATE phones SET name = $1, email = $2 WHERE id = $3',
    [phone_name, phone_company, cost],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`phone modified with ID: ${id}`)
    }
  )
}

const deletephone = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM phones WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`phone deleted with ID: ${id}`)
  })
}


module.exports = {
  getPhones,
  createPhones,
  updatePhones,
  deletephone,
}