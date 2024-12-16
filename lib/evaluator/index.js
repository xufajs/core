const evaluator = require('./evaluator');
const template = require('./template');
const transform = require('./transform');

module.exports = {
  ...evaluator,
  ...template,
  ...transform,
};
