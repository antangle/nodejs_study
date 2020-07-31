const express = require('express');
const router = express.Router();

const userRouter = require('./user/index');
const storeRouter = require('./store/index');
const commonRouter = require('./common/index');

router.use('/user', userRouter);
router.use('/store', storeRouter);
router.use('/common', commonRouter);


module.exports = router;
