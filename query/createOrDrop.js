const Pool = require('./pool');
const pool = Pool.pool;


pool.on('connect', () => {
  console.log('connected to the db');
});

// Create Table
const createPhoneTable = () => {
  const phoneCreateQuery = `CREATE TABLE IF NOT EXISTS phone
  (id SERIAL PRIMARY KEY,
  phone_name VARCHAR(50), 
  phone_brand VARCHAR(50),
  phone_cost INT
  )`;

  pool.query(phoneCreateQuery,[])
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};
const createUserBidTable = () => {
    const UserBidCreateQuery = `CREATE TABLE IF NOT EXISTS user_bid
    (id SERIAL PRIMARY KEY,
    user_id INT, 
    phone_name VARCHAR(50), 
    phone_brand VARCHAR(50),
    phone_color VARCHAR(50),
    phone_storage INT,
    current_carrier VARCHAR(10),
    want_carrier VARCHAR(10),
    want_plan INT,
    want_payment_period INT,
    contract VARCHAR(10),
    want_contract_period INT,
    return_phone INT,
    six_month_payment_plan INT,
    affiliate_card INT,
    requirements TEXT,
    safe_number INT,
    bid_time INT
    )`;
  
    pool.query(UserBidCreateQuery, [])
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
};
const createTempUserBidTable = () => {
  const UserBidCreateQuery = `CREATE TABLE IF NOT EXISTS temp_user_bid
  (id SERIAL PRIMARY KEY,
  user_id INT UNIQUE, 
  phone_name VARCHAR(50), 
  phone_brand VARCHAR(50),
  phone_color VARCHAR(50),
  phone_storage INT,
  current_carrier VARCHAR(10),
  want_carrier VARCHAR(10),
  want_plan INT,
  want_payment_period INT,
  contract VARCHAR(10),
  want_contract_period INT,
  return_phone INT,
  six_month_payment_plan INT,
  affiliate_card INT,
  requirements TEXT,
  safe_number INT,
  bid_time INT
  )`; 

  pool.query(UserBidCreateQuery, [])
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};
const createUsersTable = () => {
  const UserBidCreateQuery = `CREATE TABLE IF NOT EXISTS 
  users(id SERIAL PRIMARY KEY,
  nickname VARCHAR(50), 
  user_name VARCHAR(50), 
  email VARCHAR(100), 
  password VARCHAR(50)
  )`;

  pool.query(UserBidCreateQuery, [])
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};

// drop table
const dropPhoneTable = () => {
  const phoneDropQuery = 'DROP TABLE IF EXISTS phone';
  pool.query(phoneDropQuery)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};
const dropUsersTable = () => {
  const usersDropQuery = `DROP TABLE IF EXISTS users`;
  pool.query(usersDropQuery)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};
const dropUserBidTable = () => {
  const userBidDropQuery = `DROP TABLE IF EXISTS user_bid`;
  pool.query(userBidDropQuery)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};

//insert dummy data
const insertDummyUsers = () => {
  const insertUsersQuery = `
  INSERT INTO users(nickname) 
  VALUES
  ('antangle'),
  ('zanaris'),
  ('hairy monster'),
  ('jihun'),
  ('mememememe'),
  ('lilia'),
  ('ryze'),
  ('katarina')`;
  pool.query(insertUsersQuery)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};
const insertDummyPhone = () => {
  const insertPhoneQuery = `
  INSERT INTO phone(
    phone_name, phone_brand, phone_cost) 
  VALUES
  ('Iphone8', 'Apple',350000),
  ('Galaxy Note9', 'Samsung',300000),
  ('IphoneX', 'Apple',1200000),
  ('LG-G6', 'LG',400000),
  ('Galaxy9', 'Samsung', 250000),
  ('Galaxy6', 'Samsung',500000),
  ('Galaxy Note10', 'Samsung',700000),
  ('Galaxy7', 'Samsung',200000)`;
  pool.query(insertPhoneQuery)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};

// create all
const createAllTables = () => {
  createUserBidTable();
  createUsersTable();
  createPhoneTable();
  createTempUserBidTable();
};


//drop all
const dropAllTables = () => {
  dropPhoneTable();
  dropUsersTable();
  dropUserBidTable();
};
const insertAllTables =() =>{
  insertDummyPhone();
  insertDummyUsers();
};

const initTables=() =>{
  dropAllTables();
  createAllTables();
  insertAllTables();
};


pool.on('remove', () => {
  console.log('client removed');
});

module.exports = {
  createAllTables,
  dropAllTables,
  insertAllTables,
  initTables,
};