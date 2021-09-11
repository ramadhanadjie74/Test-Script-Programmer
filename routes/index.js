const express = require('express');
const router = express.Router();
const OauthController = require('../controllers/oauthcontroller');
const OAuthServer = require('express-oauth-server');

router.oauth = new OAuthServer({
	model: OauthController
});

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', {title: 'Express'});
});

router.post('/oauth/token', router.oauth.token());

router.post('/oauth/set_client', function (req, res, next) {
	OauthController.setClient(req.body)
		.then((client) => res.json(client))
		.catch((error) => {
			return next(error);
		});
});

router.post('/oauth/signup', function (req, res, next) {
	OauthController.setUser(req.body)
		.then((user) => res.json(user))
		.catch((error) => {
			return next(error);
		});
});

router.post('/absen/set', router.oauth.authenticate(), function (req, res, next) {
	OauthController.setAttendance(req.headers.authorization, req.body)
		.then((presence) => res.json(presence))
		.catch((error) => {
			return next(error);
		});
});

router.get('/absen', router.oauth.authenticate(), function (req, res, next) {
	OauthController.getAttendance(req.headers.authorization)
		.then((presence) => res.json(presence))
		.catch((error) => {
			return next(error);
		});
});

module.exports = router;
