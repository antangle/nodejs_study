const express = require('express');
const path = require('path');
const logger = require('morgan');
const app = express();

var phoneDB = require('./query/phone');
var userDB = require('./query/user');
var BidRouter = require('./routes/bid');
var routeRouter = require('./routes/redirect');

//view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get('/antangle', (req,res)=> {
  
});

app.get('/app/buy/1', (req,res) =>{
  res.sendFile(path.join(__dirname + '/www/app/buy/1/index.html'));
});

app.use(express.static(path.join(__dirname, 'www')));
app.get('/findPhone', phoneDB.getPhones);
app.post('/startBid', BidRouter);

app.use('/', (req, res) =>{
  res.sendFile(path.join(__dirname +'/www/hosting_index.html'));
});

//Home

//app.use('/buy', db.getPhones);
//app.get('/users', db.getUsers);
//app.get('/users/:id', db.getUsersbyId);
//app.post('/users', db.createUser)
//app.put('/users/:id', db.updateUser)
//app.delete('/users/:id', db.deleteUser)
//POST PUT DELETE


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500)
  .send('error');
})
const port = 3000;
app.listen(port, ()=> {
  console.log(`app running on port ${port}`)
});