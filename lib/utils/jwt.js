const jwt = require('jsonwebtoken');

const { secret } = require('../../config');
const {
    sequelize : {
        User,
        AccessSubject,
        AdminUser
    }
} = require('../models');

const { JsonWebTokenError  } = jwt;

function getSecretKeyForUser(user) {
    return `${secret}${user.email}${user.passwordHash}`;
}

async function generateToken(user, options = {}) {
    const adminUser = await AdminUser.findOne({
        where : { workspaceId: user.workspaceId }
    });

    // set rootTopic in payload to simply identify user's workspace in broker
    const payload = {
        userId    : user.id,
        rootTopic : adminUser.rootTopic
    };

    const secretKey = getSecretKeyForUser(user);

    return jwt.sign(payload, secretKey, options);
}

async function verifyToken(token) {
    const data = jwt.decode(token);

    if (!data || !data.userId) throw new JsonWebTokenError('invalid token');

    const user = await User.findByPk(data.userId);
    const accessSubject = user && await AccessSubject.findOne({
        where : {
            userId        : user.id,
            email         : user.email,
            workspaceId   : user.workspaceId,
            mobileEnabled : true,
            enabled       : true
        }
    });

    if (!user || !accessSubject) throw new JsonWebTokenError('invalid token');

    const secretKey = getSecretKeyForUser(user);

    return [ jwt.verify(token, secretKey), user ];
}

module.exports = {
    generateToken,
    verifyToken
};
