const express = require('express');
const router = express.Router();

const storeRouter = require('./store/storeAuction');
const buyRouter = require('./user/buy');
const myPageRouter = require('./user/myPage');
const myAuctionRouter = require('./user/myAuction');
const niceRouter = require('./nice');

//user API
router.use('/buy', buyRouter);
router.use('/myAuction', myAuctionRouter);
router.use('/myPage', myPageRouter);

//store API
router.use('/store', storeRouter);

//nice authentication
router.use('/nice', niceRouter);

module.exports = router;
