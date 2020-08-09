const express = require('express');
const router = express.Router();

const landingRouter = require('./landing');
const niceRouter = require('./nice');


router.use('/landing', landingRouter);
router.use('/nice', niceRouter);


module.exports = router;
