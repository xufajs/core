const primaryMemory = require('./primary-memory');
const workerMemory = require('./worker-memory');
const sharedMemory = require('./shared-memory');

module.exports = {
  ...primaryMemory,
  ...workerMemory,
  ...sharedMemory,
};
