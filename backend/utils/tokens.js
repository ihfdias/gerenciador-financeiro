const crypto = require('crypto');

function generateSecureToken(size = 32) {
  return crypto.randomBytes(size).toString('hex');
}

module.exports = {
  generateSecureToken,
};
