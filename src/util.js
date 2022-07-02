const { getHash } = require('@nichoth/multihash')

module.exorts = {
    blobHash: function (file) {
        return '&' + getHash(file)
    }
}
