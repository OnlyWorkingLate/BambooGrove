'use strict';
module.exports = {
    success: (res, data) => {
        let result = {
            status: 'OK'
        };
        if(data) {
            result.data = data;
        }
        res..json(result);
    },
    error: (res, message, statusCode) => {
        res.statusCode(statusCode || 400).json({
            status: 'error',
            message: message
        });
    }
};
