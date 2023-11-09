const { api } = require('../../../config');

const STATUS_CODES = {
    OK          : 200,
    BAD_REQUEST : 400
};

function checkAuthRequest(req, res, result) {
    const {
        data : {
            redirect_uri,
            state
        }
    } = result;

    res.render('auth', {
        redirect_uri,
        state,
        api_url : api.url
    });
}

function obtainToken(req, res, result) {
    const { status, data } = result;

    let responseBody = null;

    if (status === 1) {
        const {
            token_type,
            access_token,
            refresh_token,
            expires_in
        } = data;

        responseBody = {
            token_type,
            access_token,
            expires_in
        };

        if (refresh_token) responseBody.refresh_token = refresh_token;

        res.status(STATUS_CODES.OK);
    } else {
        const { error } = data;

        responseBody = {
            error
        };

        res.status(STATUS_CODES.BAD_REQUEST);
    }

    res
        .type('application/json')
        .send(responseBody);
}

module.exports = {
    checkAuthRequest,
    obtainToken
};
