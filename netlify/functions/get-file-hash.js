var createHash = require('crypto').createHash

function getHash (file) {
    var hash = createHash('sha256')
    hash.update(file)
    var _hash = hash.digest('base64')
    return _hash
}

module.exports = getHash
