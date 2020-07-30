const express = require('express');
const router = express.Router();

const storeRouter = require('./store/storeAuction');
const buyRouter = require('./user/buy');
const myAuctionRouter = require('./user/myAuction');
const niceRouter = require('./nice');

//user API
router.use('/buy', buyRouter);
router.use('/myAuction', myAuctionRouter);

//store API
router.use('/store', storeRouter);

//nice authentication
router.use('/nice', niceRouter);
module.exports = router;
