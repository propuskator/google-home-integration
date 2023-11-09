const { Router } = require('express');

const controllers = require('../controllers');

const router = Router();

// OAuth
router.get('/oauth/login', controllers.oauth.checkAuthRequest);
router.post('/oauth/login', controllers.oauth.login);
router.post('/oauth/token', controllers.oauth.obtainToken);

module.exports = router;
