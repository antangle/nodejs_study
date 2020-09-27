const express = require('express');
const router = express.Router();

const landingRouter = require('./landing');

router.use('/landing', landingRouter);

module.exports = router;
