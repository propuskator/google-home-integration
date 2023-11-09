const Sequelize = require('sequelize');

class DELETED_AT_DATE extends Sequelize.DataTypes.DATE {
    escape = false;

    _stringify(value) {
        return value instanceof Date ? 'CURRENT_TIMESTAMP(3)' : '0';
    }
}

DELETED_AT_DATE.prototype.key = 'DELETED_AT_DATE';

function classToInvokable(Class) {
    return new Proxy(Class, {
        apply(Target, thisArg, args) {
            return new Target(...args);
        },
        construct(Target, args) {
            return new Target(...args);
        },
        get(target, p) {
            return target[p];
        }
    });
}

Sequelize.DataTypes.DELETED_AT_DATE = classToInvokable(DELETED_AT_DATE);
