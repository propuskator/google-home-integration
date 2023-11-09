const ChistaESModule = require('chista');

const { makeServiceRunner } = require('./utils/chistaUtils');

const chista = new ChistaESModule.default({
    defaultLogger : (type, data) => {
        const { result } = data;

        if (result instanceof Error || type === 'error') console.error({ type, data });
    }
});

chista.makeServiceRunner = makeServiceRunner;

module.exports = chista;
