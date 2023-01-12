const router = require('express').Router();
const passport = require('passport');
const {
	getIndex,
	getLogin,
	getSignup,
	postLogin,
	postSignup,
	getFailLogin,
	getFailSignup,
	getLogout,
	failRoute,
} = require('../controllers/controller');
const checkAuthentication = require('../middlewares/auth');
const { fork } = require('child_process');

// Index
router.get('/', checkAuthentication, getIndex);

// Login
router.get('/login', getLogin);
router.post(
	'/login',
	passport.authenticate('login', { failureRedirect: '/faillogin' }),
	postLogin
);
router.get('/faillogin', getFailLogin);

// Signup
router.get('/signup', getSignup);
router.post(
	'/signup',
	passport.authenticate('signup', { failureRedirect: '/failsignup' }),
	postSignup
);
router.get('/failsignup', getFailSignup);

// Redirect to login & signup
router.post('/redirect-signup', (req, res) => res.redirect('/signup'));
router.post('/redirect-login', (req, res) => res.redirect('/login'));

// Logout
router.post('/logout', getLogout);

// Info
router.get('/info', (req, res) => {
	res.json({
		argumentos_de_entrada: process.argv.slice(2),
		nombre_sistema_operativo: process.platform,
		version_node: process.version,
		memoria_total_reservada: process.memoryUsage().rss,
		path_de_ejecucion: process.execPath,
		process_id: process.pid,
		carpeta_del_proyecto: process.cwd(),
	});
});

// Api randoms
router.get('/api/randoms', (req, res) => {
	let { cantidad } = req.query.cantidad || 500000000;
	let obj = {};

	const forked = fork('./controllers/randoms.js');
	forked.send({ cantidad, obj })
	
	forked.on('message', msg => res.json(msg));
});

// Fail route
router.get('*', failRoute);

module.exports = router;
