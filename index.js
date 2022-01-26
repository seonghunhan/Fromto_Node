const express = require('./config/express');
const app = express()
const {logger} = require('./config/winston');

const port = 3000;
app.listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);