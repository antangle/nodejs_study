const express = require('express');
const router = express.Router();

const homeRouter = require('./store/storeAuction');
const buyRouter = require('./user/buy');
const myAuctionRouter = require('./user/myAuction');

//user API
router.use('/buy', buyRouter);
router.use('/myAuction', myAuctionRouter);

//store API
router.use('/home', homeRouter);


module.exports = router;
