const cache = require('./cache');
const cacheTenants = require('./cache-tenants');
const fifo = require('./fifo');
const lifo = require('./lifo');

module.exports = {
  ...cache,
  ...cacheTenants,
  ...fifo,
  ...lifo,
};
