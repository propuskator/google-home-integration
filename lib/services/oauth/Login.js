const { URL, URLSearchParams } = require('url');

const ValidationException                               = require('../../utils/errors/ValidationException');
const { sequelize: { User, Workspace, AccessSubject } } = require('../../models');
const { generateToken }                                 = require('../../utils/jwt');
const { TOKEN_EXPIRES_IN }                              = require('../../constants/oauth');
const {
    INVALID_CREDENTIALS,
    ACCESS_IS_TEMPORARILY_DENIED
}                      = require('../../utils/errors/codes/validation');
const BaseOauthService = require('./BaseOauthService');

/**
 * Description of the use-case: https://developers.google.com/assistant/smarthome/develop/implement-oauth#handle_authorization_requests
 * This use case implements 2-4 steps from the algorithm
 */
class Login extends BaseOauthService {
    static validationRules = {
        redirect_uri  : [ 'required', 'url' ],
        state         : [ 'string' ],
        workspaceName : [ 'required', 'string' ],
        email         : [ 'required', 'email' ],
        password      : [ 'required', 'string' ]
    };

    async execute(data) {
        const { redirect_uri, state, workspaceName, email, password } = data;

        this.checkRedirectUri(redirect_uri);

        const loginError = new ValidationException(INVALID_CREDENTIALS, {
            workspaceName : INVALID_CREDENTIALS,
            email         : INVALID_CREDENTIALS,
            password      : INVALID_CREDENTIALS
        });

        const workspace = await Workspace.findOne({ where: { name: workspaceName } });

        if (!workspace) throw loginError;

        const user = await User.findOne({
            where : {
                email,
                workspaceId : workspace.id
            },
            paranoid : false
        });

        if (!user || user.isSoftDeleted()) throw loginError;

        const isPasswordCorrect = await user.checkPassword(password);

        if (!isPasswordCorrect) throw loginError;

        const accessSubject = await AccessSubject.findOne({
            where : {
                userId      : user.id,
                email       : user.email,
                workspaceId : user.workspaceId
            }
        });

        if (!accessSubject) throw loginError;

        if (!accessSubject.mobileEnabled || !accessSubject.enabled) {
            throw new ValidationException(ACCESS_IS_TEMPORARILY_DENIED, {
                workspaceName : ACCESS_IS_TEMPORARILY_DENIED
            });
        }

        const code = await generateToken(user, { expiresIn: TOKEN_EXPIRES_IN });
        const uri = new URL(redirect_uri);

        uri.search = new URLSearchParams({ code, state });

        return {
            status : 1,
            data   : {
                redirect_uri : uri
            }
        };
    }
}

module.exports = Login;
