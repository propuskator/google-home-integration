const BaseOauthService = require('./BaseOauthService');

/**
 * Description of the use-case: https://developers.google.com/assistant/smarthome/develop/implement-oauth#handle_authorization_requests
 * This use case implements first step from the algorithm
 */
class CheckAuthRequest extends BaseOauthService {
    static validationRules = {
        client_id    : [ 'string' ],
        redirect_uri : [ 'string' ],
        state        : [ 'string' ]
    };

    async execute(data) {
        const { client_id, redirect_uri, state } = data;

        this.checkClientId(client_id);
        this.checkRedirectUri(redirect_uri);

        return {
            status : 1,
            data   : {
                redirect_uri,
                state
            }
        };
    }
}

module.exports = CheckAuthRequest;
