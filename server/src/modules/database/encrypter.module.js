// modules
require('dotenv').config();
const crypto = require('crypto');

// Function to hash a parameter
const encrypt = ((_text) => {
    // Example: Generate a random IV for AES-256-CBC
    let cipher = crypto.createCipheriv(process.env.ENCRYPTION_ALGORITHM, process.env.ENCRYPTION_KEY, process.env.ENCRYPTION_IV);
    let encrypted = cipher.update(_text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
});


module.exports = encrypt;