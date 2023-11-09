const { createHash } = require('crypto');

function cloneDeep(data) {
    return JSON.parse(JSON.stringify(data));
}

function createSha256Hash(data) {
    return createHash('sha256').update(data).digest('hex');
}

module.exports = {
    cloneDeep,
    createSha256Hash
};
