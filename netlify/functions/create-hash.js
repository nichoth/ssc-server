// var crypto = require('crypto')
// var _createHash = require('crypto').createHash
// var slugify = require('underscore.string/slugify');
var Blake2s = require('blake2s-js')

module.exports = function createHash (file) {
    // return crypto.createHash('md5').update(file).digest('hex')
    // var slugifiedHash = slugify(hash)
    // return slugifiedHash
    // return hash

    var h = new Blake2s(32);
    var enc = new TextEncoder();
    h.update(enc.encode(file));
    return h.hexDigest();  // returns string with hex digest
}
