const { Router } = require('express');

const router = Router();

module.exports = (smartHomeApp) => {
    router.post('/smarthome/fulfillment', smartHomeApp);

    return router;
};
