var crypto = require('crypto')
// var _createHash = require('crypto').createHash
// var slugify = require('underscore.string/slugify');

module.exports = function createHash (file) {
    return crypto.createHash('md5').update(file).digest('hex')
    // var slugifiedHash = slugify(hash)
    // return slugifiedHash
    // return hash
}
