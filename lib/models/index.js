const Sequelize = require('sequelize');

const dbConfig = require('../../config/db')[process.env.NODE_ENV || 'development'];

require('../registerSequelizeDatatypes');

const AccessSubject = require('./sequelize/AccessSubject');
const User          = require('./sequelize/User');
const Workspace     = require('./sequelize/Workspace');
const AdminUser     = require('./sequelize/AdminUser');

const AccessTokenReader = require('./backend/AccessTokenReader');

function initSequelizeModels(config) {
    const { database, username, password, dialect, host, port, pool, logging } = config;

    const sequelize = new Sequelize(database, username, password, {
        host,
        port,
        dialect,
        pool,
        logging
    });

    const models = {
        AccessSubject,
        User,
        Workspace,
        AdminUser
    };

    Object
        .values(models)
        .forEach(model => model.init(sequelize, model.options()));
    Object
        .values(models)
        .forEach(model => model.initRelationsAndHooks(sequelize));

    return models;
}

function initBackendModels() {
    // here may be initialization logic for the backend models

    const models = {
        AccessTokenReader
    };

    return models;
}

function initAllModels({ sequelizeConfig }) {
    const sequelizeModels = initSequelizeModels(sequelizeConfig);
    const backendModels = initBackendModels();

    return {
        sequelize : sequelizeModels,
        backend   : backendModels
    };
}

module.exports = initAllModels({ sequelizeConfig: dbConfig });
