const PLACEHOLDER_TAG = '@@tag/_';

const _ = { [PLACEHOLDER_TAG]: true };

function isPlaceholder(obj) {
  return !!(obj && obj[PLACEHOLDER_TAG]);
}

module.exports = { _, isPlaceholder };
