const { getHash } = require('@nichoth/multihash')

module.exports = {
    blobHash: function (file) {
        return '&' + getHash(file)
    }
}
