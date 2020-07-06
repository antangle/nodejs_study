const {Pool} = require('pg')
const pool = new Pool({
  "user": 'postgres',
  "host": 'localhost',
  "database": 'user',
  "password": 'lawrence',
  "port": 5432,

})

const getUsers = (req, res) => {
    pool.query(`SELECT * FROM users ORDER BY id`, (error, results) => {
      if (error) {
        throw error
      }
      res.status(200).json(results.rows)
    })
}
const getUsersbyId = (req ,res) =>{
  const id = parseInt(req.params.id)
  pool.query(`SELECT * FROM users WHERE id = $1`, [id], 
  (err, result)=>{
      try{
        res.status(200).json(result.rows)
      }
      catch{
        console.log(err)
      }
  })
}
const createUser = (request, response) => {
  const { name, email } = request.body

  pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`User added with ID: ${result.insertId}`)
  })
}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}

module.exports = {
  getUsers,
  getUsersbyId,
  createUser,
  updateUser,
  deleteUser,
}