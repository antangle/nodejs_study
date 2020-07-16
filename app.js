const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
const swagger = require('./swagger/swagger');
const dotenv = require('dotenv');
dotenv.config();

const buyRouter = require('./routes/buy');
const userRouter = require('./routes/user');
const landingRouter = require('./routes/landing');
const config = require('./config');
const port = process.env.port || 9000;
const swaggerDoc = swaggerJsDoc(swagger.swaggerOptions);

//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');
app.set('jwt-secret', config.secret);

//later configure cors option
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/buy', buyRouter);
app.use('/user', userRouter);
app.use('/landing', landingRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/', (req, res) =>{
  res.send('Welcome to Backend');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500)
  res.send(err);
})

app.listen(port, ()=> {
  console.log(`app running on port ${port}`)
});
