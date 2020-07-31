const express = require('express');
const router = express.Router();

const storeRouter = require('./store/storeAuction');
const buyRouter = require('./user/buy');
const myAuctionRouter = require('./user/myAuction');
const niceRouter = require('./nice');

const app01Router = require('./nice');
const web01Router = require('./nice');

router.use('/web01', web01Router);
router.use('/app01', app01Router);


//user API
router.use('/buy', buyRouter);
router.use('/myAuction', myAuctionRouter);

//store API
router.use('/store', storeRouter);

//nice authentication
router.use('/nice', niceRouter);
module.exports = router;