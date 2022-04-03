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

// 무중단 배포관련 타임아웃 서비스 중단 문제 해결
app.use(function(req, res, next) {
    if (isDisableKeepAlive) {
      res.set('Connection', 'close')
    }
    next()
  })


app.listen(port, function () {
process.send('ready') //무중단 배포
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);
})

// 무중단 배포
process.on('SIGINT', function () {
    isDisableKeepAlive = true
    app.close(function () {
    console.log('server closed')
    process.exit(0)
    })
  })

// 정적파일제공
app.use(static(path.join(__dirname,'../')))






//logger.info(`${process.env.NODE_ENV} - ${secret_config.s3AccessKey + secret_config.s3SevretAccessKey}`);