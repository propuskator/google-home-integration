class Exception extends Error {
    constructor({
        type,
        message,
        code,
        errors = []
    }) {
        super();
        if (!type) throw new Error('"type" required');
        if (!message) throw new Error('"message" required');

        this.type = type;
        if (code) this.code = code;
        this.message = message;
        this.errors = errors;
    }
}

module.exports = Exception;
