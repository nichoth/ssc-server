var createHash = require('crypto').createHash
// var slugify = require('underscore.string/slugify');

module.exports = function createMsg (file) {
    var hash = createHash('md5').update(file).digest('hex')
    // var slugifiedHash = slugify(hash)
    // return slugifiedHash
    return hash
}
