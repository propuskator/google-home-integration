const { DataTypes } = require('sequelize');

const { DATE_DATATYPE_PRECISION } = require('../../constants/sequelize');
const { createSha256Hash }        = require('../../utils');
const BaseModel                   = require('./BaseModel');

class AdminUser extends BaseModel {
    static schema() {
        return {
            id           : { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
            workspaceId  : { type: DataTypes.BIGINT },
            login        : { type: DataTypes.STRING, allowNull: false },
            avatar       : { type: DataTypes.STRING, allowNull: true },
            passwordHash : { type: DataTypes.STRING },
            mqttToken    : { type: DataTypes.STRING },
            createdAt    : { type: DataTypes.DATE(DATE_DATATYPE_PRECISION) },
            updatedAt    : { type: DataTypes.DATE(DATE_DATATYPE_PRECISION) },
            rootTopic    : {
                type : DataTypes.VIRTUAL,
                get() {
                    return createSha256Hash(this.getDataValue('login'));
                }
            }
        };
    }
}

module.exports = AdminUser;
