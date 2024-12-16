const cache = require('./cache');
const core = require('./core');
const evaluator = require('./evaluator');
const memory = require('./memory');
const S = require('./fun');

module.exports = {
  ...cache,
  ...core,
  ...evaluator,
  ...memory,
  S,
  _: S._,
};
