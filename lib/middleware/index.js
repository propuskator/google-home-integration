const bodyParser = require('./bodyParser');
const { cors }   = require('./cors');

module.exports = {
    ...bodyParser,
    cors
};
