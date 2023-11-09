const AbstractException = require('./AbstractException');
const { externalApi }   = require('./codes');

class ExternalApiException extends AbstractException {
    constructor(code, payload = {}) {
        super(code, ExternalApiException, payload);
    }

    static get defaultError() {
        return {
            type    : 'external_api',
            message : 'External API error',
            errors  : []
        };
    }

    static get codes() {
        return {
            [externalApi.WRONG_GOOGLE_CLIENT_ID] : () => ({
                ...this.defaultError,
                code    : externalApi.WRONG_GOOGLE_CLIENT_ID,
                message : 'Wrong Google Client ID'
            }),
            [externalApi.WRONG_GOOGLE_REDIRECT_URI] : () => ({
                ...this.defaultError,
                code    : externalApi.WRONG_GOOGLE_REDIRECT_URI,
                message : 'Wrong Google redirect URI'
            }),
            [externalApi.ACCESS_BACKEND_REQUEST_ERROR] : () => ({
                ...this.defaultError,
                code    : externalApi.ACCESS_BACKEND_REQUEST_ERROR,
                message : 'Request to the Access Backend completed with error'
            })
        };
    }
}

module.exports = ExternalApiException;
