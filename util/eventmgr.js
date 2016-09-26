//  서버의 이벤트 처리를 담당하는 모듈입니다.
'use strict';

const eventEmitter = require('events').EventEmitter;

exports.db_connect = () => {
    eventEmitter.emit('db_connect');
};
exports.db_open = (cb) => {
    eventEmitter.once('db_open', cb);
};
exports.db_error = (cb) => {
    eventEmitter.on('db_error', cb);
};

exports = eventEmitter;