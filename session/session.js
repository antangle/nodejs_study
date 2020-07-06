var express = require('express')
var parseurl = require('parseurl')
var session = require('express-session')
 
var app = express()
 
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
 
app.get('/', function (req, res, next) {
    if(req.session.num === undefined)
        req.session.num = 1;
    else{
        req.session.num = req.session.num + 1;
    }
  res.send(`you viewed this page : ${req.session.num}`)
})
 

app.listen(3000, function(){
    console.log('hi!')
});