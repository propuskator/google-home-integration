const backendClient        = require('../../backendClient');
const ExternalApiException = require('../../utils/errors/ExternalApiException');
const ValidationException  = require('../../utils/errors/ValidationException');
const {
    externalApi : { ACCESS_BACKEND_REQUEST_ERROR },
    validation  : { OPEN_CLOSE_DOOR_ERROR }
} = require('../../utils/errors/codes');

module.exports = class AccessTokenReader {
    static async getListOfAvailableReaders(token) {
        const response = await backendClient.get('access-token-readers', {
            headers : {
                'X-AuthToken' : token
            }
        });
        const { status, data } = await response.json();

        if (status === 0) throw new ExternalApiException(ACCESS_BACKEND_REQUEST_ERROR);

        return data;
    }

    // open or close access token reader depend on current state(open if it is closed and vise versa)
    static async openOrClose(id, token) {
        const response = await backendClient.post(`access-token-readers/${id}/open`, {}, {
            headers : {
                'X-AuthToken' : token
            }
        });

        const { status, type } = await response.json();

        if (status === 0) throw new ValidationException(OPEN_CLOSE_DOOR_ERROR, { type });
    }
};
