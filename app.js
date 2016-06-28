// NOTE: 환경변수를 설정하고 테스트바람.
/*
 PORT        실행될 포트번호. 기본 5500번
 MONGO_URI   DB연결 URI. 없이 실행시키면 연결 오류.
 NODE_ENV 서버 실행 모드.
 development / production / maintance 세 가지가 있고, development에서는 DB연결을 하지 않는다.
 */
'use strict';
const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    favicon = require('serve-favicon'),
    ejs = require('ejs');

let app = express();

//  For environment value check
console.log('NODE_ENV is ' + app.get('env'));
console.log('PORT is ' + process.env.PORT);
console.log('MONGO_URI is ' + process.env.MONGO_URI);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.set('view engine', 'ejs');
app.set('PORT', process.env.PORT || 4586);
app.set('views', __dirname + '/views');

//  set routes
app.use('/', require('./routes/index'));
app.use('/post', require('./routes/post'));
app.use('/page', require('./routes/page'));

//  start server with environment value 'NODE_ENV'.
switch(app.get('env')) {
    case 'development':
        app.listen(app.get('PORT'), () => {
            console.log('BambooGrove server has been started without db connection at port ' + app.get('PORT'));
        });
        break;
    case 'maintance':
        break;
    case 'production':
    default:
        mongoose.connect(process.env.MONGO_URI);
        let connection = mongoose.connection;
        //  DB connect error handle
        connection.on('errror', (err) => {
            console.log('Error connecting DB. + Err: ' + err);
            return;
        });
        //  run server
        connection.on('open', () => {
            app.listen(app.get('PORT'), () => {
                console.log('BambooGrove server has been started at port ' + app.get('PORT'));
            });
        });
        break;
}