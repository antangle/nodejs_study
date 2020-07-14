const express = require('express');
const path = require('path');
const logger = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const cors = require('cors');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
const swaggerOptions ={
  swaggerDefinition:{
    info: {
      title: 'My First API info',
      version: '3.0.0',
      description: 'API info',
      contact: {
        name: 'antangle'
      },
      servers: ["http://localhost:9000"]
    },
    host: "localhost:9000",
    basepath: "/",
  },
  apis: ['swagger.yaml']
}

const swaggerDoc = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

//later configure cors option
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const buyRouter = require('./routes/buy');
const landingRouter = require('./routes/landing');
app.use('/buy', buyRouter);
app.use('/landing', landingRouter);
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
  res.send('error');
})

const port = 9000;
app.listen(port, ()=> {
  console.log(`app running on port ${port}`)
});
