const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');
const path = require('path');
var cors = require('cors');
module.exports = function () {
    const app = express();

    app.use(compression());

    app.use(express.json());

    app.use(express.urlencoded({extended: true}));

    app.use(methodOverride());

    app.use(cors());
    // app.use(express.static(process.cwd() + '/public'));

    /* App (Android, iOS) */
    // TODO: 도메인을 추가할 경우 이곳에 Route를 추가하세요.
    require('../src/app/User/userRoute')(app);
    // require('../src/app/Board/boardRoute')(app);

    var options = {
        dotfiles: 'ignore',
        etag: false,
        extensions: ['htm', 'html'],
        index: false,
        maxAge: '1d',
        redirect: false,
        setHeaders: function (res, path, stat) {
          res.set('x-timestamp', Date.now())
        }
      }
      
      //app.use(express.static('html', options))
      app.use(express.static(path.join(__dirname, '/var/www/html')));
      //app.use(express.static(__dirname + '/var/www/html'));

      //app.use('/static', express.static(__dirname + 'public'));
      //app.use('/static', express.static(__dirname + 'public'));

    return app;
};