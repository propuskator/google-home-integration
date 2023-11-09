const { services: { backend } } = require('../config');
const ApiFetch                  = require('./utils/api/ApiFetch');

module.exports = new ApiFetch({
    protocol : backend.protocol,
    host     : backend.host,
    port     : backend.port
});
