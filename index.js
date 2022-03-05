const express = require('./config/express');
const app = express()
const path = require('path');
const static = require('serve-static')
const {logger} = require('./config/winston');

const port = 3000;
app.listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);


app.use(static(path.join(__dirname,'../')))

