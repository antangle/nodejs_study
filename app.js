const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
const swagger = require('./swagger/swagger.js');
const dotenv = require('dotenv');
dotenv.config();

const {verifyToken} = require('./middleware/verify');


const port = process.env.port || 9000;
const swaggerDoc = swaggerJsDoc(swagger.swaggerOptions);

//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');
app.set('jwt-secret', process.env.JWT_SECRET);

//later configure cors option
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//save jihun 
const APIwebRouter = require('./api_web/index');
const nicewebRouter = require('./api_web/nice');
const loginwebRouter = require('./api_web/login');
const landingwebRouter = require('./api_web/landing');

app.use('/api', APIwebRouter);
app.use('/login', loginwebRouter);
app.use('/nice', nicewebRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/landing', landingwebRouter);

//web
const web01Router = require('./web01/index');
app.use('/web01', web01Router);

//app
const app01Router = require('./app01/index');
app.use('/app01', app01Router);

//test
const testRouter = require('./api_web/login');
app.use('/test', testRouter);


app.use('/', (req, res) =>{
  res.send('Welcome to Backend');
});

app.listen(port, ()=> {
  console.log(`app running on port ${port}`)
});

