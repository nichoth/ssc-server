// const { getHash } = require('@nichoth/multihash')
const { getHash } = require('@nichoth/blob-store')

module.exports = {
    blobHash: function (file) {
        return getHash(file)
    }
}
