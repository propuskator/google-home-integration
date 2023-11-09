const { verifyToken }    = require('../../utils/jwt');
const SmartHomeException = require('../../utils/errors/SmartHomeException');
const RESPONSE_STATUSES  = require('./etc/responseStatuses');
const ERROR_CODES        = require('./etc/errorCodes');

class IntentsController {
    constructor(intentsProcessor, logger) {
        this.intentsProcessor = intentsProcessor;
        this.logger = logger;
        this._onSyncHandler = this._onSyncHandler.bind(this);
        this._onQueryHandler = this._onQueryHandler.bind(this);
        this._onExecuteHandler = this._onExecuteHandler.bind(this);
        this._onDisconnectHandler = this._onDisconnectHandler.bind(this);
    }

    async init(app) {
        await this.intentsProcessor.init(app);
    }

    get handlers() {
        return {
            onSync       : (req, headers) => this.onIntent(req, headers, this._onSyncHandler),
            onQuery      : (req, headers) => this.onIntent(req, headers, this._onQueryHandler),
            onExecute    : (req, headers) => this.onIntent(req, headers, this._onExecuteHandler),
            onDisconnect : (req, headers) => this.onIntent(req, headers, this._onDisconnectHandler)
        };
    }

    authorize(token) {
        return verifyToken(token);
    }

    async onIntent(req, headers, handler) {
        try {
            const authorizationHeader = headers.authorization;
            const token = authorizationHeader.replace('Bearer ', '');
            const [ payload, user ] = await this.authorize(token);

            this.logger.info({ handler: handler.name, userId: user.id, userEmail: user.email });

            // additional user's info that is outside the sequelize model
            const userInfo = {
                token,
                rootTopic : payload.rootTopic
            };

            const isSynced = !!this.intentsProcessor.getSmartHomeUser(user.id);
            const { inputs: [ { intent } ] } = req;

            // in a case when the user is not synced yet and the current intent
            // is not "SYNC"(because sync will be in _onSyncHandler)
            if (!isSynced && intent !== 'action.devices.SYNC') await this.intentsProcessor.sync(user.id, userInfo);

            return await handler(req, user, userInfo);
        } catch (err) {
            this.logger.error(err);

            if (err instanceof SmartHomeException) {
                return {
                    requestId : req.requestId,
                    payload   : {
                        status    : err.status,
                        errorCode : err.code
                    }
                };
            }

            return { // returns unhandled error in intents handlers
                requestId : req.requestId,
                payload   : {
                    status : RESPONSE_STATUSES.ERROR
                }
            };
        }
    }

    async _onSyncHandler(req, user, userInfo) {
        await this.intentsProcessor.sync(user.id, userInfo); // try to sync user's devices
        const smartHomeUser = this.intentsProcessor.getSmartHomeUser(user.id);
        const smartHomeDevices = smartHomeUser.getSmartHomeDevices();
        const devicesObjects = Object.values(smartHomeDevices).map(device => device.toObject());

        return {
            requestId : req.requestId,
            payload   : {
                agentUserId : user.id,
                devices     : devicesObjects
            }
        };
    }

    async _onQueryHandler(req, user) {
        const [ { payload: { devices } } ] = req.inputs;
        const devicesIds = devices.map(({ id }) => id);
        const devicesStates = {};
        const smartHomeUser = this.intentsProcessor.getSmartHomeUser(user.id);

        this.logger.info({ handler: '_onQueryHandler', devicesIds });

        devicesIds.forEach(deviceId => {
            try {
                const device = smartHomeUser.getSmartHomeDevice(deviceId);

                if (!device) throw new SmartHomeException(ERROR_CODES.deviceNotFound, RESPONSE_STATUSES.ERROR);

                const state = device.query();

                devicesStates[deviceId] = {
                    ...state,
                    status : RESPONSE_STATUSES.SUCCESS
                };
            } catch (err) {
                this.logger.error(err);

                if (err instanceof SmartHomeException) {
                    devicesStates[deviceId] = {
                        status    : err.status,
                        errorCode : err.code
                    };
                } else {
                    devicesStates[deviceId] = {
                        status    : RESPONSE_STATUSES.ERROR,
                        errorCode : ERROR_CODES.deviceOffline
                    };
                }
            }
        });

        return {
            requestId : req.requestId,
            payload   : {
                devices : devicesStates
            }
        };
    }

    // eslint-disable-next-line no-unused-vars
    async _onExecuteHandler(req, user) {
        const [ { payload: { commands } } ] = req.inputs;
        const deviceStates = [];
        const smartHomeUser = this.intentsProcessor.getSmartHomeUser(user.id);

        for (const { devices, execution } of commands) {
            for (const { id: deviceId } of devices) {
                for (const { command, params } of execution) {
                    this.logger.info({ handler: '_onExecuteHandler', command, params });

                    try {
                        const device = smartHomeUser.getSmartHomeDevice(deviceId);

                        if (!device) throw new SmartHomeException(ERROR_CODES.deviceNotFound, RESPONSE_STATUSES.ERROR);

                        await device.execute(command, params);

                        const state = device.query();

                        deviceStates.push({
                            ids    : [ deviceId ],
                            status : RESPONSE_STATUSES.SUCCESS,
                            states : state
                        });
                    } catch (err) {
                        this.logger.error(err);

                        if (err instanceof SmartHomeException) {
                            deviceStates.push({
                                ids       : [ deviceId ],
                                status    : err.status,
                                errorCode : err.code
                            });
                        } else {
                            deviceStates.push({
                                ids       : [ deviceId ],
                                status    : RESPONSE_STATUSES.ERROR,
                                errorCode : ERROR_CODES.deviceOffline
                            });
                        }
                    }
                }
            }
        }

        return {
            requestId : req.requestId,
            payload   : {
                commands : deviceStates
            }
        };
    }

    async _onDisconnectHandler(req, user) {
        await this.intentsProcessor.disconnect(user.id);

        return {};
    }
}

module.exports = IntentsController;
