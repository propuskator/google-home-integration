const bcrypt        = require('bcryptjs');
const { DataTypes } = require('sequelize');

const { DATE_DATATYPE_PRECISION } = require('../../constants/sequelize');
const BaseModel                   = require('./BaseModel');

class User extends BaseModel {
    static schema() {
        return {
            id           : { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
            workspaceId  : { type: DataTypes.BIGINT, allowNull: false },
            email        : { type: DataTypes.STRING, allowNull: false },
            passwordHash : { type: DataTypes.STRING, allowNull: false },
            mqttToken    : { type: DataTypes.STRING },
            createdAt    : { type: DataTypes.DATE(DATE_DATATYPE_PRECISION) },
            deletedAt    : {
                type         : DataTypes.DELETED_AT_DATE(DATE_DATATYPE_PRECISION),
                allowNull    : true,
                defaultValue : null
            },
            updatedAt : { type: DataTypes.DATE(DATE_DATATYPE_PRECISION) },
            password  : { type: DataTypes.VIRTUAL }
        };
    }

    static options() {
        return {
            paranoid   : true,
            timestamps : true
        };
    }

    static initRelations(sequelize) {
        const WorkspaceModel = sequelize.model('Workspace');

        this.AssociationWorkspace = this.belongsTo(WorkspaceModel, { as: 'workspace', foreignKey: 'workspaceId' });
    }

    async checkPassword(plain) {
        return bcrypt.compare(plain, this.passwordHash);
    }
}

module.exports = User;
