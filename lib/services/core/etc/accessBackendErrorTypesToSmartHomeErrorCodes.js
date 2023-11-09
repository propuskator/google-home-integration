const ERROR_CODES = require('./errorCodes');

module.exports = {
    notFound      : ERROR_CODES.deviceNotFound,
    timeout       : ERROR_CODES.deviceOffline,
    openDoorError : ERROR_CODES.securityRestriction
};
