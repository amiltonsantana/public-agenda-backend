require('dotenv/config');

const server = require('./server/server');
require('./server/databate');
require('./server/routes')(server);
