const clone = require('./clone');
const container = require('./container');
const deserialize = require('./deserialize');
const dict = require('./dict');
const encryption = require('./encryption');
const getMethods = require('./get-methods');
const logger = require('./logger');
const safeStringify = require('./safe-stringify');
const serialize = require('./serialize');
const simpleTimer = require('./simple-timer');
const uuid = require('./uuid');

module.exports = {
  ...clone,
  ...container,
  ...deserialize,
  ...dict,
  ...encryption,
  ...getMethods,
  ...logger,
  ...safeStringify,
  ...serialize,
  ...simpleTimer,
  ...uuid,
};
