const { Logger }                       = require('../utils/logger');
const { cloneDeep }                    = require('../utils');
const { validation: { FORMAT_ERROR } } = require('../utils/errors/codes');
const { dumpError, errorHandler }      = require('./errors');
const ValidationException              = require('./errors/ValidationException');

function defaultParamsBuilder() {
    return {};
}

function defaultContextBuilder(req) {
    return cloneDeep(req.session && req.session.context ? req.session.context : {});
}

function defaultResponseBuilder(req, res, result) {
    res.send(result);
}

function makeServiceRunner(
    serviceClass,
    paramsBuilder = defaultParamsBuilder,
    contextBuilder = defaultContextBuilder,
    responseBuilder = defaultResponseBuilder
) {
    return async function serviceRunner(req, res) {
        const params = paramsBuilder(req);
        const context = contextBuilder(req);
        const logger = Logger(serviceClass.name);
        const service = new serviceClass({ context, logger });

        try {
            const result = await service.run(params);

            responseBuilder(req, res, result);
        } catch (err) {
            logger.error(err);

            let formattedError = err;

            if (formattedError.code === FORMAT_ERROR) {
                formattedError = new ValidationException(FORMAT_ERROR, err.fields);
            }

            const dumpedError = dumpError(formattedError);

            return errorHandler(dumpedError, req, res);
        }
    };
}

module.exports = {
    makeServiceRunner
};
