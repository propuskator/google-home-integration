const { backend: { AccessTokenReader } } = require('../../models');
const deviceTypes                        = require('./etc/deviceTypes');
const homieToSmartHomeDeviceMappers      = require('./homieToSmartHomeDeviceMappers');
const SmartHomeUser                      = require('./SmartHomeUser');

class IntentsProcessor {
    constructor(homieCloud, logger) {
        this.homieCloud = homieCloud;
        this.logger = logger;
        this.smartHomeUsers = {};
    }

    async init(app) {
        this.app = app;

        await this.homieCloud.init();
    }

    async sync(userId, { token, rootTopic }) {
        const accessTokenReaders = await AccessTokenReader.getListOfAvailableReaders(token);
        // retrieve the homie instance related to user's workspace
        const homie = await this.homieCloud.initNewHomie(rootTopic);
        // reader's code is an id of the device in the homie
        const homieDevices = accessTokenReaders.reduce((acc, { code }) => {
            try {
                const homieDevice = homie.getDeviceById(code);

                return [ ...acc, homieDevice ];
            } catch (err) {
                this.logger.warn(`Collecting homie devices error: device with id="${code}" not found`);

                return acc;
            }
        }, []);
        const smartHomeDevices = (await Promise.all(homieDevices
            .map(homieDevice => {
                // in current realization every device is mapped to SWITCH Smart Home type
                const toSmartHomeDeviceMapFn = homieToSmartHomeDeviceMappers[deviceTypes.SWITCH];
                // find related access token reader to retrieve a name for a Smart Home device
                const relatedAccessTokenReader = accessTokenReaders.find(accessTokenReader => {
                    return accessTokenReader.code === homieDevice.getId();
                });

                return toSmartHomeDeviceMapFn(homieDevice, {
                    name                : relatedAccessTokenReader.name,
                    token,
                    accessTokenReaderId : relatedAccessTokenReader.id
                }).catch(err => {
                    this.logger.warn(`Map Homie device to Smart Home device error: ${JSON.stringify({
                        deviceId : homieDevice.getId(),
                        error    : err.message
                    })}`);
                });
            })))
            .filter(x => x) // remove nulls and "undefined" values caused by rejected promises
            .flat() // flat if some homieDevices was mapped to several Smart Home devices
            .reduce((acc, smartHomeDevice) => ({
                ...acc,
                [smartHomeDevice.getId()] : smartHomeDevice
            }), {});

        if (!this.smartHomeUsers[userId]) {
            this.smartHomeUsers[userId] = new SmartHomeUser(userId, { homie, app: this.app });
        }

        const user = this.smartHomeUsers[userId];

        user.setSmartHomeDevices(smartHomeDevices);

        // link with description: https://developers.google.com/assistant/smarthome/develop/request-sync
        user.addRequestSync(); // eslint-disable-line no-sync
        // link with description: https://developers.google.com/assistant/smarthome/develop/report-state#node.js
        user.startReportDevicesStates();
    }

    disconnect(userId) {
        const user = this.smartHomeUsers[userId];

        user.removeRequestSync(); // eslint-disable-line no-sync
        user.stopReportDevicesStates();

        delete this.smartHomeUsers[userId];
    }

    getSmartHomeUser(userId) {
        return this.smartHomeUsers[userId];
    }
}

module.exports = IntentsProcessor;
