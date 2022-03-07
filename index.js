const express = require('./config/express');
const app = express();
const path = require('path');
const static = require('serve-static');
const {logger} = require('./config/winston');
// const AWS = require('aws-sdk');
// const secret_config = require('./config/secret');


const port = 3000;
app.listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);

// 정적파일제공
app.use(static(path.join(__dirname,'../')))

// const s3 = new AWS.S3({
//     accessKeyId: secret_config.s3AccessKey , // 사용자의 AccessKey
//     secretAccessKey: secret_config.s3SevretAccessKey // 사용자의 secretAccessKey
// });

// const bucket_name = "fromto"; //생성한 버킷 이름

// app.get('', (req, res, next) => {
//     const fileContent = fs.readFileSync('./sample1.txt');

//     const params = {
//         Bucket: bucket_name,
//         Key: '저장했네샘플', // file name that you want to save in s3 bucket
//         Body: fileContent
//     }

//     s3.upload(params, (err, data) => {
//         if (err) {
//             res.send(err);
//         }
//         else {
//             res.status(201).send(data);
//         }
//     });
// });


//logger.info(`${process.env.NODE_ENV} - ${secret_config.s3AccessKey + secret_config.s3SevretAccessKey}`);