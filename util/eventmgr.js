//  서버의 이벤트 처리를 담당하는 모듈입니다.
'use strict';

const EventEmitter = require('events').EventEmitter;
let emitter = new EventEmitter();

exports.db_connect = () => {
    emitter.emit('db_connect');
};
exports.db_open = (cb) => {
    emitter.once('db_open', cb);
};
exports.db_error = (cb) => {
    emitter.on('db_error', cb);
};

exports = emitter;