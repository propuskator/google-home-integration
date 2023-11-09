const BaseService                   = require('../BaseService');
const ExternalApiException          = require('../../utils/errors/ExternalApiException');
const { google }                    = require('../../../config');
const {
    WRONG_GOOGLE_REDIRECT_URI,
    WRONG_GOOGLE_CLIENT_ID,
    WRONG_GOOGLE_CLIENT_SECRET
} = require('../../utils/errors/codes/external-api');

class BaseOauthService extends BaseService {
    checkRedirectUri(redirectUri) {
        const expectedRedirectUri = `${google.baseRedirectUri}/${google.projectId}`;
        const expectedSandboxRedirectUri = `${google.baseSandboxRedirectUri}/${google.projectId}`;
        const expectedPlaygroundRedirectUri = google.basePlaygroundRedirectUri;

        if (
            redirectUri !== expectedRedirectUri &&
            redirectUri !== expectedSandboxRedirectUri &&
            redirectUri !== expectedPlaygroundRedirectUri
        ) {
            throw new ExternalApiException(WRONG_GOOGLE_REDIRECT_URI);
        }
    }

    checkClientId(clientId) {
        if (clientId !== google.clientId) {
            throw new ExternalApiException(WRONG_GOOGLE_CLIENT_ID);
        }
    }

    checkClientSecret(clientSecret) {
        if (clientSecret !== google.clientSecret) {
            throw new ExternalApiException(WRONG_GOOGLE_CLIENT_SECRET);
        }
    }
}

module.exports = BaseOauthService;
