const express = require('express');
const router = express.Router();

const loginRouter = require('./login');
const apiRouter = require('./api');

router.use('/login', loginRouter);
router.use('/api', apiRouter);

module.exports = router;
