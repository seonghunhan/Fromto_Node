const mysql = require('mysql2/promise');
const {logger} = require('./winston');

// TODO: 본인의 DB 계정 입력
const pool = mysql.createPool({
    host: 'dorisdb.c0i2uo2ldqsg.ap-northeast-2.rds.amazonaws.com',
    user: 'master',
    port: '3306',
    password: 'zhtmahtm159',
    database: 'FromTo'
});

module.exports = {
    pool: pool
};