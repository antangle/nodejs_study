const bcrypt = require('bcrypt');
const crypto = require("crypto")
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
  isValidId(login_id){
    return /^[A-z][A-z0-9]{5,14}$/.test(login_id);
  },
  isValidNickname(nick){
    return /^[가-힣a-zA-Z][^:<>()&.~\s]{0,14}$/.test(nick);
  },
  isValidPassword(password){
    return /^(?=[^a-z]*[a-z])(?=\D*\d)[^:&.~\s]{6,20}$/.test(password);
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
  },
  encryptJson(json){
    try{
      const encryptData = jwt.sign(json,
        process.env.JWT_SECRET, { expiresIn: '100' })
        return encryptData;
      }
      catch(err){
        console.log(err);
        var errMessage = 'json encryption failed';
        return errMessage;
      }
  }
};

module.exports = {
    helper
}