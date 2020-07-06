var express = require('express');
const { response } = require('express');
var router = express.Router();


router.get('/app/buy/:step', function(req, res, next) {
    console.log(req.params.step);
    res.redirect('/app/buy/' + req.params.step);
});
router.get('/ajax', function(req, res, next) {
    var data = req.query.data
    console.log(data);
    var responseData = 'galaxy';
    res.send({result: responseData});

});


module.exports = router;