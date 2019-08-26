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
  useFindAndModify: false,
};

let mongoConnection;

if (process.env.MONGODB_CONNECTION) {
  mongoConnection = mongoose.connect(process.env.MONGODB_CONNECTION, { useNewUrlParser: true });
} else {
  mongoConnection = mongoose.connect(`mongodb://${host}:${port}/${database}`, options);
}

module.exports = mongoConnection;
