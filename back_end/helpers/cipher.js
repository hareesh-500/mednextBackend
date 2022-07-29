var crypt = require('crypto');

//This function is used to encript given string
exports.encrypt = (encryptStr) => {
    try {
        var key = crypt.createCipher(process.env.DBDATA_ACCESS_KEY, process.env.DBDATA_PASSWORD_KEY);
        var encrypted_str = key.update(encryptStr, 'utf8', 'hex')
        encrypted_str += key.final('hex');
        return encrypted_str
    } catch (e) {
        return e
    }
}

//This function is used to decript given string
exports.decrypt = (decryptStr) => {
    var key = crypt.createDecipher(process.env.DBDATA_ACCESS_KEY, process.env.DBDATA_PASSWORD_KEY);
    var decrypted_str = key.update(decryptStr, 'hex', 'utf8')
    decrypted_str += key.final('utf8');
    return decrypted_str
}
