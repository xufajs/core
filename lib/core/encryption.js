const crypto = require('node:crypto');
const { clone } = require('./clone');

const DEFAULT_ALGORITHM = 'aes-256-cbc';

function generateIv() {
  return crypto.randomBytes(16);
}

function encrypt(secretKey, text, algorithm = DEFAULT_ALGORITHM) {
  const iv = generateIv();
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(secretKey, text, algorithm = DEFAULT_ALGORITHM) {
  const index = text.indexOf(':');
  const iv = Buffer.from(text.slice(0, index), 'hex');
  const encryptedText = Buffer.from(text.slice(index + 1), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
}

function isEncrypted(text, encryptionKey, algorithm) {
  try {
    decrypt(encryptionKey, text, algorithm);
    return true;
  } catch (err) {
    return false;
  }
}

function ensureEncrypted(text, encryptionKey, algorithm) {
  if (!text) {
    return text;
  }
  return isEncrypted(text, encryptionKey, algorithm) ? text : encrypt(encryptionKey, text, algorithm);
}

function ensureDecrypted(text, encryptionKey, algorithm) {
  if (!text) {
    return text;
  }
  return isEncrypted(text, encryptionKey, algorithm) ? decrypt(encryptionKey, text, algorithm) : text;
}

function encryptFields(srcObj, fields, encryptionKey, algorithm) {
  const obj = clone(srcObj);
  fields.forEach((field) => {
    obj[field] = ensureEncrypted(obj[field], encryptionKey, algorithm);
  });
  return obj;
}

function decryptFields(srcObj, fields, encryptionKey, algorithm) {
  const obj = clone(srcObj);
  fields.forEach((field) => {
    obj[field] = ensureDecrypted(obj[field], encryptionKey, algorithm);
  });
  return obj;
}

module.exports = {
  encrypt,
  decrypt,
  ensureEncrypted,
  ensureDecrypted,
  encryptFields,
  decryptFields,
  isEncrypted,
};
