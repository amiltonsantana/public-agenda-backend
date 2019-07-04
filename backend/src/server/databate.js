const mongoose = require('mongoose');

const mongodb = require('../../credentials/mongodb.json');

mongoose.Promise = global.Promise;

const {
  username, password, host, port, database,
} = mongodb;

const options = {
  user: username,
  pass: password,
  useNewUrlParser: true,
};

module.exports = mongoose.connect(`mongodb://${host}:${port}/${database}`, options);
