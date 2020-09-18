const express = require('express');
const router = express.Router();

const userRouter = require('./user/index');
const storeRouter = require('./store/index');
const commonRouter = require('./common/index');
const adminRouter = require('./admin/index');

router.use('/user', userRouter);
router.use('/store', storeRouter);
router.use('/common', commonRouter);
router.use('/admin', commonRouter);


module.exports = router;
