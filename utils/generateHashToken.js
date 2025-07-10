const crypto = require('crypto');

const generateHashedToken = () => {
  const token = crypto.randomBytes(32).toString('hex'); // raw token to send in email
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex'); // store in DB

  return { token, hashedToken };
};

module.exports = generateHashedToken;