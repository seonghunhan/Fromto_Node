const express = require('./config/express');
const app = express()
const path = require('path');
const static = require('serve-static')
const {logger} = require('./config/winston');

const port = 3000;
app.listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);

// // route
// app.get("/*", function (req, res) {
//     res.sendFile(__dirname + "/front/build/index.html");
//   });

// // middleware
//app.use(express.static(path.join(__dirname, "/var/www/html")));

// // route
// app.get("/*", function (req, res) {
//   res.sendFile(__dirname + "/profile/index.html");
// });

app.use(static(path.join(__dirname,'../')))

//app.use('/static', express.static(__dirname + 'html'));

//app.use(express.static('var'));

//app.use('/', express.pathComp(path.join(__dirname, 'var')));


// var pathComp= require("express-static");
// app.use(pathComp(__dirname+"/client"));