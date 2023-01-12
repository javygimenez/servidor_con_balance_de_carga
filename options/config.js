const optionsMariaDB = {
    client: 'mysql',
    connection: {
		host: '127.0.0.1',
		user: 'root',
		password: '',
		database: 'desafio_primera_db'
	}
}

const optionsSQLite3 = {
	client: 'sqlite3',
	connection: {
		filename: './db/ecommerce.sqlite3'
	},
	useNullAsDefault: true
}

module.exports = { optionsSQLite3, optionsMariaDB };