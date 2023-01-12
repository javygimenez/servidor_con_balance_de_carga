const express = require('express');
const { Server: HttpServer } = require('http');
const { Server: IOServer } = require('socket.io');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');
const passport = require('passport');
const yargs = require('yargs/yargs')

const args = yargs(process.argv.slice(2)).options({
	p: {
		alias: "port",
		default: "8080",
		describe: "Puerto de escucha del servidor",
	},
	m: {
		alias: "mode",
		default: "FORK",
		describe: "Modo de operacion del servidor",
		type: "string"
	},
}).parse();

const portArgs = args.port || 8080;
const PORT = process.env.PORT || portArgs;
const modeServer = args.mode || "FORK";



const router = require('./routes/router');
const Container = require('./container.js');
require('./middlewares/auth');
const { optionsMariaDB, optionsSQLite3 } = require('./options/config.js');

const app = express();

const httpserver = new HttpServer(app);
const io = new IOServer(httpserver);

const products = new Container(optionsSQLite3, 'products');
const messages = new Container(optionsMariaDB, 'messages');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());
app.use(
	session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: false,
		rolling: true,
		cookie: {
			httpOnly: false,
			secure: false,
			maxAge: 100000,
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('views'));
app.engine('handlebars', engine());
app.set('views', './views');
app.set('view engine', 'handlebars');
app.use(router);

io.on('connection', async socket => {
	console.log('Conexión establecida');
	const dbProducts = await products.getAll();
	io.sockets.emit('products', dbProducts);
	const dbMessages = await messages.getAll();
	io.sockets.emit('messages', dbMessages);
	socket.on('product', async product => {
		products.save(product);
		const dbProducts = await products.getAll();
		io.sockets.emit('products', dbProducts);
	});
	socket.on('message', async message => {
		messages.save(message);
		const dbMessages = await messages.getAll();
		io.sockets.emit('messages', dbMessages);
	});
});

const cluster = require("cluster")
const os = require("os")
const numCPUs = os.cpus().length

if (modeServer == "CLUSTER") {
	if (cluster.isPrimary) {
		console.log(`Master ${process.pid} is running`);
		for (let i = 0; i < numCPUs; i++) {
			cluster.fork();
		}

		cluster.on("exit", (worker, code, signal) => {
			console.log(`Worker ${worker.proccess.pid} died`);
		});
	} else {
		const server = httpserver.listen(PORT, () => {
			mongoose.connect(process.env.MONGO_ATLAS_SRV);
			console.log(`Server running on port ${PORT}`);
		});

		server.on("error", (error) => console.log(`Error en servidor: ${error}`));
		console.log(`Worker ${process.pid} started`);
	}
} else {
	const server = httpserver.listen(PORT, () => {
		mongoose.connect(process.env.MONGO_ATLAS_SRV);
		console.log(`Server running on port ${PORT}`);
	});

	server.on("error", (error) => console.log(`Error en servidor: ${error}`));
}
