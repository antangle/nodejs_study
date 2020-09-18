const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const morgan = require('morgan');
const fs = require('fs');
dotenv.config();

const {verifyToken} = require('./middleware/verify');

const port = process.env.port || 9000;

//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');

app.set('jwt-secret', process.env.JWT_SECRET);

//later configure cors option
app.use(cors());

if(process.env.ENVIRONMENT === 'pro'){
  var accessLogStream = fs.createWriteStream(
    path.join(__dirname, '/access.log'), {flags: 'a'}
  );
  app.use(morgan('combined', {stream: accessLogStream}));
}
else{
  app.use(morgan('dev'));
}


app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//const swagger = require('./swagger/swagger.js');
//const swaggerJsDoc = require('swagger-jsdoc');
//const swaggerUi = require('swagger-ui-express');
//const swaggerDoc = swaggerJsDoc(swagger.swaggerOptions);
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
const landingwebRouter = require('./api_web/landing');
app.use('/landing', landingwebRouter);

//web
const web01Router = require('./web01/index');
app.use('/web01', web01Router);

//app
const app01Router = require('./app01/index');
app.use('/app01', app01Router);

//test
/*
const testRouter = require('./test/index');
app.use('/test', testRouter);
*/
app.use('/what', (req, res) =>{
  res.send('Backend');
});

app.use('/', (req, res) =>{
  res.send('Welcome to Backend');
});

app.listen(port, ()=> {
  console.log(`app running on port ${port}`)
});

