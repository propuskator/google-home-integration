const AbstractException = require('./AbstractException');
const { validation }    = require('./codes');

class ValidationException extends AbstractException {
    constructor(code, payload = {}) {
        super(code, ValidationException, payload);
    }

    static get defaultError() {
        return {
            type    : 'validation',
            message : 'Validation error',
            errors  : []
        };
    }

    static get codes() {
        return {
            [validation.FORMAT_ERROR] : (fields) => ({
                ...this.defaultError,
                code    : validation.FORMAT_ERROR,
                message : 'Format error',
                errors  : Object.entries(fields).map(([ field, value ]) => ({ [field]: value }))
            }),
            [validation.INVALID_CREDENTIALS] : (fields) => ({
                ...this.defaultError,
                code    : validation.INVALID_CREDENTIALS,
                message : 'Invalid credentials',
                errors  : fields
            }),
            [validation.ACCESS_IS_TEMPORARILY_DENIED] : (fields) => ({
                ...this.defaultError,
                code    : validation.ACCESS_IS_TEMPORARILY_DENIED,
                message : 'Access is temporarily denied',
                errors  : fields
            }),
            [validation.OPEN_CLOSE_DOOR_ERROR] : (fields) => ({
                ...this.defaultError,
                code    : validation.OPEN_CLOSE_DOOR_ERROR,
                message : 'Open/Close door error occurred',
                errors  : fields
            })
        };
    }
}

module.exports = ValidationException;
