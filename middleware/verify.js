const jwt =require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({path: path.join(__dirname, '/../.env')});

const verifyToken = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res.status(400).send('Token not provided');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      user_id: decoded.user_id
    };
    next();
  } catch (error) {
    return res.status(401).send('Authentication Failed');
  }
};
module.exports ={
    verifyToken,
}