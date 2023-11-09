const { verifyToken, generateToken } = require('../../utils/jwt');
const {
    TOKEN_EXPIRES_IN,
    TOKEN_SECONDS_TO_EXPIRATION
} = require('../../constants/oauth');

const BaseOauthService = require('./BaseOauthService');

const GRANT_TYPES = {
    authorization_code : 'authorization_code',
    refresh_token      : 'refresh_token'
};

/**
 * This use-case implements handling token exchange requests:
 * https://developers.google.com/assistant/smarthome/develop/implement-oauth#handle_token_exchange_requests
 */
class ObtainToken extends BaseOauthService {
    static validationRules = {
        client_id     : [ 'string' ],
        client_secret : [ 'string' ],
        grant_type    : [ 'string', { one_of: Object.values(GRANT_TYPES) } ],
        code          : [ 'string' ],
        redirect_uri  : [ 'string', 'url' ],
        refresh_token : [ 'string' ]
    };

    async execute(data) {
        try {
            const {
                client_id,
                client_secret,
                grant_type,
                code,
                redirect_uri,
                refresh_token
            } = data;

            this.checkClientId(client_id);
            this.checkClientSecret(client_secret);

            const result = {
                token_type   : 'Bearer',
                access_token : '',
                expires_in   : 0
            };

            if (grant_type === GRANT_TYPES.authorization_code) {
                this.checkRedirectUri(redirect_uri);
            }

            const tokenToVerify = grant_type === GRANT_TYPES.authorization_code ? code : refresh_token;
            const [ , user ] = await verifyToken(tokenToVerify);

            const accessToken = await generateToken(user, { expiresIn: TOKEN_EXPIRES_IN });

            result.access_token = accessToken;
            result.expires_in = TOKEN_SECONDS_TO_EXPIRATION; // 10 minutes in seconds

            if (grant_type === GRANT_TYPES.authorization_code) {
                const refreshToken = await generateToken(user);

                result.refresh_token = refreshToken;
            }

            return {
                status : 1,
                data   : result
            };
        } catch (err) {
            this.logger.warn(err);

            return {
                status : 0,
                data   : {
                    error : 'invalid_grant'
                }
            };
        }
    }
}

module.exports = ObtainToken;
