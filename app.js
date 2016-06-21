// NOTE: 환경변수를 설정하고 테스트바람.
/*
    PORT        실행될 포트번호. 기본 4586번
    MONGO_URI   DB연결 URI. 없이 실행시키면 연결 오류.
    BAMBOO_MODE 서버 실행 모드.
                ALONE / NORMAL 두개가 있고, ALONE에서는 DB연결을 하지 않는다.
*/
'use strict';
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const ejs = require('ejs');

const server = express();

//  For environment value check
console.log('BAMBOO_MODE is ' + process.env.BAMBOO_MODE);
console.log('PORT is ' + process.env.PORT);
console.log('MONGO_URI is ' + process.env.MONGO_URI);

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }))
server.use(morgan('dev'));

server.set('view engine', 'ejs');
server.set('PORT', process.env.PORT || 4586);
server.set('views', __dirname + '/views');

//  start server with environment value 'BAMBOO_MODE'.
start(process.env.BAMBOO_MODE);

function start(mode) {
    mode = mode || 'NORMAL';
    if(mode === 'ALONE') {
        server.listen(server.get('PORT'), () => {
            console.log('BambooGrove server has been started without db connection at port ' + server.get('PORT'));
        });
    } else {
        const MONGO_URI = process.env.MONGO_URI;
        mongoose.connect(MONGO_URI);
        let connection = mongoose.connection;
        //  DB connect error handle
        connection.on('errror', (err) => {
            console.log('Error connecting DB. + Err: ' + err);
            return;
        });
        //  run server
        connection.on('open', () => {
            server.listen(server.get('PORT'), () => {
                console.log('BambooGrove server has been started at port ' + server.get('PORT'));
            });
        });
    }
}
