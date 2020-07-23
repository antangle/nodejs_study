const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({path: path.join(__dirname, '/../.env')});
const helper ={
  hashPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5));
  },
  
  comparePassword(password, hashPassword) {
    return bcrypt.compareSync(password, hashPassword);
  },
  
  validatePassword(password){
    if (password.length <= 5 || password === '') {
      return false;
    } return true;
  },
  isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  },
  
  generateToken(id) {
    try{
    const token = jwt.sign({id: id},
      process.env.JWT_SECRET, { expiresIn: '1d' })
      return token;
    }
    catch(err){
      console.log(err);
      var errMessage = 'token generation failed';
      return errMessage;
    }
  }
};

module.exports = {
    helper
}