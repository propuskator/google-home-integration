class SmartHomeException extends Error {
    constructor(code, status) {
        if (!code) throw new Error('SmartHomeException code required');
        if (!status) throw new Error('SmartHomeDevice status required');

        super();

        this.code = code;
        this.status = status;
    }
}

module.exports = SmartHomeException;
