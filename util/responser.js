'use strict';

module.exports = {
    success: (res, data) => {
        let result = {
            status: 'OK'
        };
        if(data) {
            result.data = data;
        }
        res.json(result);
    },
    error: (res, message = 'An error occured', statusCode = 401) => {
        res.status(statusCode).json({
            status: 'error',
            message: message
        });
    }
};
