'use strict';
// NOTE: 환경변수를 설정하고 테스트바람.
/*
 BAMBOO_PORT        실행될 포트번호.
 BAMBOO_MODE 서버 실행 모드.
 development / production / maintance 세 가지가 있고, development에서는 DB연결을 하지 않는다.
 DB_USER mySQL db user
 DB_PASSWORD mySQL db password
 */
const express = require('express'),
    mongoose = require('mongoose'),
    mysql = require('mysql'),
    sequelize = require('sequelize'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    favicon = require('serve-favicon'),
    ejs = require('ejs');

//  db connection information from environment variable
let db_connection = mysql.createConnection({
  host: 'jaewook.me',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'bamboo'
});

let app = express();

//  For environment value check
console.log('NODE_ENV is ' + process.env.BAMBOO_MODE || 'normal');
console.log('PORT is ' + process.env.BAMBOO_PORT);
console.log('DB_USER is ' + process.env.DB_USER);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set('port', process.env.BAMBOO_PORT);

app.set('view engine', 'ejs');
app.set('PORT', process.env.BAMBOO_PORT || 8081);
app.set('views', __dirname + '/views');

//  set routes
app.use('/', require('./routes/index'));
app.use('/post', require('./routes/post'));
app.use('/page', require('./routes/page'));

//  start server with environment value 'NODE_ENV'.
switch(process.env.BAMBOO_MODE) {
    case 'development':
        app.listen(app.get('port'), () => {
            console.log('BambooGrove server has been started without db connection at port ' + app.get('port'));
        });
        break;
    case 'normal':
        db_connection.connect((err) => {
            if(err) {
                console.error('error connecting to db.\n' + err.stack);
                return;
            }
            app.listen(app.get('port'), (err) => {
                console.log('Server was started at port at ' + app.get('port'));
            });
        });
        break;
}
