const { DataTypes } = require('sequelize');

const { DATE_DATATYPE_PRECISION } = require('../../constants/sequelize');
const BaseModel                   = require('./BaseModel');

class Workspace extends BaseModel {
    static schema() {
        return {
            id          : { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
            name        : { type: DataTypes.STRING, allowNull: false, unique: true },
            accessToken : { type: DataTypes.STRING, allowNull: false, unique: true },
            createdAt   : { type: DataTypes.DATE(DATE_DATATYPE_PRECISION) },
            updatedAt   : { type: DataTypes.DATE(DATE_DATATYPE_PRECISION) }
        };
    }

    static options() {
        return {
            timestamps : false
        };
    }
}

module.exports = Workspace;
