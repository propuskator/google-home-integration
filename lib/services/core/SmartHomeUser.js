/* eslint-disable no-sync */
const { MS_IN_SECOND }                = require('../../constants/common');
const { TOKEN_SECONDS_TO_EXPIRATION } = require('../../constants/oauth');

class SmartHomeUser {
    constructor(id, { homie, app } = {}) {
        this.id = id;
        this.homie = homie;
        this.app = app;
        this.smartHomeDevices = {};
        this.requestSyncInterval = null;
        this.requestSyncHandlers = {
            onNewDeviceAdded : this.onNewDeviceAdded.bind(this),
            onDeviceRemoved  : this.onDeviceRemoved.bind(this)
        };
    }

    async requestSync() {
        await this.app.requestSync(`${this.id}`);
    }

    async onNewDeviceAdded() {
        await this.requestSync();
    }

    async onDeviceRemoved({ type }) {
        if (type === 'DEVICE') await this.requestSync();
    }

    setSmartHomeDevices(smartHomeDevices) {
        this.smartHomeDevices = smartHomeDevices;
    }

    getSmartHomeDevices() {
        return this.smartHomeDevices;
    }

    getSmartHomeDevice(id) {
        return this.smartHomeDevices[id];
    }

    addRequestSync() {
        // this service("google-home") uses the same token's secret as access-backend to
        // avoid authorization with access-backend for the same user, but tokens generated by
        // google-home are short-lived, so the next interval is used to trigger request sync
        // every time when a token approximately expires. It will cause token refreshing by the
        // Google API and we don't need to refresh user's token on our own.
        this.requestSyncInterval = setInterval(
            () => this.requestSync(),
            TOKEN_SECONDS_TO_EXPIRATION * MS_IN_SECOND
        );

        this.homie.on('new_device', this.requestSyncHandlers.onNewDeviceAdded);
        this.homie.on('events.delete.success', this.requestSyncHandlers.onDeviceRemoved);
    }

    removeRequestSync() {
        clearInterval(this.requestSyncInterval);

        this.requestSyncInterval = null;

        this.homie.off('new_device', this.requestSyncHandlers.onNewDeviceAdded);
        this.homie.off('events.delete.success', this.requestSyncHandlers.onDeviceRemoved);
    }

    startReportDevicesStates() {
        Object
            .values(this.smartHomeDevices)
            .forEach(smartHomeDevices => smartHomeDevices.startReportState(this.id, this.app));
    }

    stopReportDevicesStates() {
        Object
            .values(this.smartHomeDevices)
            .forEach(smartHomeDevices => smartHomeDevices.stopReportState());
    }
}

module.exports = SmartHomeUser;
