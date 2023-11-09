const Exception  = require('../../Exception');
const { Logger } = require('../logger');

class AbstractException extends Exception {
    constructor(code, exceptionClass, payload = {}) {
        const logger = Logger(exceptionClass.name);

        if (!exceptionClass.codes[code]) {
            logger.error(`ERROR WITH CODE ${code} IS NOT HANDLED`);
            logger.error(payload);

            super({
                type    : 'unknown_error',
                message : payload.message || 'unknown_error',
                errors  : payload.errors || []
            });
        } else {
            super(exceptionClass.codes[code](payload));
        }
    }
}

module.exports = AbstractException;
