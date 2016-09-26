//  데이터베이스의 커넥션을 관리하는 모듈입니다.
'use strict';
const mongoose = require('mongoose');
const eventMgr = require('./eventmgr');
const DB_URI = process.env.DB_URI;

eventMgr.on('db_connect', () => {
    mongoose.connect(DB_URI)
    let db = mongoose.connection;
    db.on('error', () => {
        eventMgr.emit('db_error');
    });
    db.once('open', () => {
        eventMgr.emit('db_open');
    });
});