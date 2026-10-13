const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'command_vault_secure_device_secret_2026';
const KEY = crypto.createHash('sha256').update(SECRET).digest(); // 32 bytes key for aes-256-cbc
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
  if (!text) return '';
  if (typeof text !== 'string') text = String(text);
  // If already encrypted
  if (text.startsWith('enc:')) return text;

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `enc:${iv.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText) {
  if (!encryptedText) return '';
  if (typeof encryptedText !== 'string') return '';
  // If not encrypted, return as is
  if (!encryptedText.startsWith('enc:')) return encryptedText;

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText;

    const iv = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err.message);
    return encryptedText;
  }
}

module.exports = {
  encrypt,
  decrypt
};
