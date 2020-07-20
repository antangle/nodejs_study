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
const buyRouter = require('./routes/buy');
const userRouter = require('./routes/user');
const myInfoRouter = require('./routes/myInfo')
const landingRouter = require('./routes/landing');
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

app.use('/user', userRouter);
app.use('/myInfo', myInfoRouter);
app.use('/landing', landingRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/buy', buyRouter);

app.use('/', (req, res) =>{
  res.send('Welcome to Backend');
});

app.listen(port, ()=> {
  console.log(`app running on port ${port}`)
});
