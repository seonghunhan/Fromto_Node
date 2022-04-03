const express = require('./config/express');
const app = express();
const path = require('path');
const static = require('serve-static');
const {logger} = require('./config/winston');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan');
const _ = require('lodash');
// const AWS = require('aws-sdk');
// const secret_config = require('./config/secret');


const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(morgan('dev'));

app.listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);

// 정적파일제공
app.use(static(path.join(__dirname,'../')))






//logger.info(`${process.env.NODE_ENV} - ${secret_config.s3AccessKey + secret_config.s3SevretAccessKey}`);