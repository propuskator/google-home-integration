const chista = require('../chista');

const OauthCheckAuthRequest = require('../services/oauth/CheckAuthRequest');
const Login                 = require('../services/oauth/Login');
const ObtainToken           = require('../services/oauth/ObtainToken');

const { oauth: oauthResponseBuilders } = require('../utils/responseBuilders');

module.exports = {
    checkAuthRequest : chista.makeServiceRunner(
        OauthCheckAuthRequest,
        req => ({
            client_id    : req.query.client_id,
            redirect_uri : req.query.redirect_uri,
            state        : req.query.state
        }),
        () => ({}),
        oauthResponseBuilders.checkAuthRequest
    ),
    login : chista.makeServiceRunner(
        Login,
        req => ({
            redirect_uri  : req.body.redirect_uri,
            state         : req.body.state,
            workspaceName : req.body.workspaceName,
            email         : req.body.email,
            password      : req.body.password
        }),
        () => ({})
    ),
    obtainToken : chista.makeServiceRunner(
        ObtainToken,
        req => ({
            client_id     : req.body.client_id,
            client_secret : req.body.client_secret,
            grant_type    : req.body.grant_type,
            code          : req.body.code,
            redirect_uri  : req.body.redirect_uri,
            refresh_token : req.body.refresh_token
        }),
        () => ({}),
        oauthResponseBuilders.obtainToken
    )
};
