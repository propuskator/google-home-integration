class SmartHomeDevice {
    constructor(
        { id, type, traits, willReportState, attributes = {}, name },
        commands,
        queryFunction,
        reportStateHandlers = {
            start : () => {},
            stop  : () => {}
        }
    ) {
        this.id = id;
        this.type = type;
        this.traits = traits;
        this.willReportState = willReportState;
        this.attributes = attributes;
        this.name = name;
        this.commands = commands;
        this.queryFunction = queryFunction;
        this.reportStateHandlers = reportStateHandlers; // an object that contains both "start" and "stop" functions
    }

    getId() {
        return this.id;
    }

    async execute(command, params) {
        const trait = command.split('.')[3];

        await this.commands[trait](params);
    }

    query() {
        return this.queryFunction();
    }

    toObject() {
        return {
            id              : this.id,
            type            : `action.devices.types.${this.type}`,
            traits          : this.traits.map(traitName => `action.devices.traits.${traitName}`),
            willReportState : this.willReportState,
            attributes      : this.attributes,
            name            : {
                name : this.name
            },
            otherDeviceIds : [
                {
                    deviceId : this.id
                }
            ]
        };
    }

    startReportState(userId, app) {
        if (this.willReportState) this.reportStateHandlers.start(userId, app);
    }

    stopReportState() {
        if (this.willReportState) this.reportStateHandlers.stop();
    }
}

module.exports = SmartHomeDevice;
