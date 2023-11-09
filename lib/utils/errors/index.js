function errorHandler(err, req, res) {
    res.send({
        status : 0,
        error  : err
    });
}

function dumpError(err) {
    return {
        type    : err.type || 'server_error',
        code    : err.code || 'SERVER_ERROR',
        message : err.type && err.message ?
            err.message :
            'Contact with your system administrator',
        errors : err.errors && err.type ? err.errors : []
    };
}

module.exports = {
    errorHandler,
    dumpError
};
