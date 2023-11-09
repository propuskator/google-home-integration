const { smarthome } = require('actions-on-google');

class SmartHome {
    constructor({ jwt }, intentsController) {
        this.app = smarthome({ jwt });
        this.intentsController = intentsController;
    }

    async init() {
        await this.intentsController.init(this.app);

        this.app.onSync(this.intentsController.handlers.onSync); // eslint-disable-line no-sync
        this.app.onQuery(this.intentsController.handlers.onQuery);
        this.app.onExecute(this.intentsController.handlers.onExecute);
        this.app.onDisconnect(this.intentsController.handlers.onDisconnect);
    }

    getApp() {
        return this.app;
    }
}

module.exports = SmartHome;
