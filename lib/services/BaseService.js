const ServiceBaseModule = require('chista/ServiceBase');

const ServiceBase = ServiceBaseModule.default;

class BaseService extends ServiceBase {
    constructor(args) {
        super(args);

        this.logger = args.logger;
    }


    async execute() {
        throw new Error('execute method should be implemented');
    }
}

module.exports = BaseService;
