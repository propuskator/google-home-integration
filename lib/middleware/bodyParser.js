const bodyParser = require('body-parser');

const { server: { BROKEN_JSON } } = require('../utils/errors/codes');

module.exports = {
    json : bodyParser.json({
        limit  : 1024 * 1024,
        verify : (req, res, buf) => {
            try {
                JSON.parse(buf);
            } catch (err) {
                res.send({
                    status : 0,
                    error  : {
                        code : BROKEN_JSON
                    }
                });
                throw new Error(BROKEN_JSON);
            }
        }
    }),
    urlencoded : bodyParser.urlencoded({ extended: true })
};
