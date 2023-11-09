const { v4: uuidv4 } = require('uuid');

const {
    ACCESS_TOKEN_READER_NODE_ID,
    ACCESS_TOKEN_READER_SENSOR_ID
}                                                 = require('../../constants/homie');
const { createSha256Hash }                        = require('../../utils');
const { backend: { AccessTokenReader } }          = require('../../models');
const { Logger }                                  = require('../../utils/logger');
const SmartHomeException                          = require('../../utils/errors/SmartHomeException');
const ValidationException                         = require('../../utils/errors/ValidationException');
const deviceTypes                                 = require('./etc/deviceTypes');
const deviceTraits                                = require('./etc/deviceTraits');
const ERROR_CODES                                 = require('./etc/errorCodes');
const RESPONSE_STATUSES                           = require('./etc/responseStatuses');
const errorTypesToSmartHomeErrorCodes             = require('./etc/accessBackendErrorTypesToSmartHomeErrorCodes');
const { FULLY_OPEN_PERCENT, FULLY_CLOSE_PERCENT } = require('./etc/traits/openClose/constants');
const SmartHomeDevice                             = require('./SmartHomeDevice');

module.exports = {
    async [deviceTypes.SWITCH](homieDevice, { name, token, accessTokenReaderId }) {
        const node = homieDevice.getNodeById(ACCESS_TOKEN_READER_NODE_ID);
        const sensor = node.getSensorById(ACCESS_TOKEN_READER_SENSOR_ID);
        const publishEventName = sensor._getPublishEventName();

        const plainDeviceId = `${homieDevice.getId()}`;

        const deviceProperties = {
            id              : createSha256Hash(plainDeviceId),
            type            : deviceTypes.SWITCH,
            traits          : [ deviceTraits.OnOff, deviceTraits.OpenClose ],
            willReportState : true,
            attributes      : {
                // see details here: https://developers.google.com/assistant/smarthome/traits/openclose#device-attributes
                discreteOnlyOpenClose : true
            },
            name
        };

        const logger = Logger(`DeviceID=${deviceProperties.id}`);

        const queryFunction = () => { // eslint-disable-line func-style
            const homieValue = sensor.getValue();
            const smartHomeOpenCloseTraitValue = homieValue === 'true' ? FULLY_OPEN_PERCENT : FULLY_CLOSE_PERCENT;
            const smartHomeOnOffTraitValue = homieValue === 'true';
            const isOnlineHomieDevice = homieDevice.getState() === 'ready';

            return {
                openPercent : smartHomeOpenCloseTraitValue,
                on          : smartHomeOnOffTraitValue,
                online      : isOnlineHomieDevice
            };
        };

        // ignore params because access token reader change its state depending only on its current state
        const commandsHandler = ({ on, openPercent }) => new Promise((resolve, reject) => { // eslint-disable-line func-style,max-len
            const currentState = queryFunction();

            if (
                (on === true && currentState.on === true) ||
                (openPercent === FULLY_OPEN_PERCENT && currentState.openPercent === FULLY_OPEN_PERCENT)
            ) {
                return reject(new SmartHomeException(ERROR_CODES.alreadyOpen, RESPONSE_STATUSES.ERROR));
            }

            if (
                (on === false && currentState.on === false) ||
                (openPercent === FULLY_CLOSE_PERCENT && currentState.openPercent === FULLY_CLOSE_PERCENT)
            ) {
                return reject(new SmartHomeException(ERROR_CODES.alreadyClosed, RESPONSE_STATUSES.ERROR));
            }

            // AccessTokenReader.openOrClose method only publishes token to "k" sensor and after its
            // successfully execution we only know that token was successfully published to "k" sensor, but it takes
            // a while to publish target value to the "s" sensor - next handler is required to know when the "s"
            // sensor will change its value in fact. If we skip this step then onExecute handler returns to the client
            // the actual value of "s" sensor before it changes after publishing token to "k" sensor
            sensor._homie.once(publishEventName, data => {
                const [ field ] = Object.keys(data);

                if (field === 'value') resolve();
            });

            AccessTokenReader
                .openOrClose(accessTokenReaderId, token)
                .catch(err => {
                    logger.warn('command execution error: ', err);

                    if (err instanceof ValidationException) {
                        const errorCode = errorTypesToSmartHomeErrorCodes[err.errors.type] || ERROR_CODES.deviceOffline;

                        reject(new SmartHomeException(errorCode, RESPONSE_STATUSES.ERROR));
                    } else {
                        reject(err);
                    }
                });
        });

        const commands = {
            [deviceTraits.OpenClose] : commandsHandler,
            [deviceTraits.OnOff]     : commandsHandler
        };

        const reportStateHandlers = {
            start(userId, app) {
                sensor.onAttributePublish(({ field }) => {
                    if (field === 'value') {
                        const deviceId = deviceProperties.id;

                        app.reportState({ // eslint-disable-line more/no-then
                            requestId   : uuidv4(),
                            agentUserId : `${userId}`,
                            payload     : {
                                devices : {
                                    states : {
                                        [deviceId] : queryFunction()
                                    }
                                }
                            }
                        }).then(reportStateResponse => {
                            logger.info(`reportState.success ${JSON.stringify({ reportStateResponse })}`);
                        }).catch(err => {
                            logger.warn(`reportState.error ${JSON.stringify({ error: err })}`);
                        });
                    }
                });
            },
            stop() {
                sensor.deleteHandlers();
            }
        };

        return new SmartHomeDevice(
            deviceProperties,
            commands,
            queryFunction,
            reportStateHandlers
        );
    }
};
