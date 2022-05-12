// require('dotenv').config()
require('isomorphic-fetch')
var ssc = require('@nichoth/ssc/web')
var createHash = require('create-hash')

var baseUrl = 'http://localhost:8888'
var BASE = (process.env.NODE_ENV === 'test' ? baseUrl : '')

// this is a client-side file that calls our API

module.exports = function Client (keystore) {

    const client = {
        getProfile: function getProfile (did) {
            const qs = new URLSearchParams({ did }).toString()
            var url = (BASE + '/api/profile' + '?' + qs)
            return fetch(url)
        },

        // must pass a username
        // image is optional (should use existing image if there is not a new one)
        // imgHash should be the existing profile image hash
        postProfile: function (did, username, imgHash, image) {
            if (!username) return Promise.reject(
                new Error('must include username'))

            if (!imgHash && !image) return new Promise.reject(
                new Error('must include an image or a hash for an existing image')
            )

            // if we are passed an image, set _hash to the right hash
            var hash = imgHash
            if (image) {
                let _hash = createHash('sha256')
                _hash.update(image)
                hash = _hash.digest('base64')
            }

            return ssc.createMsg(keystore, null, {
                type: 'about',
                about: did,
                username,
                image: hash
            }).then(msg => {
                return fetch(BASE + '/api/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        did,
                        msg,
                        file: image
                    })
                })
            })
        },

        postPin: function (text) {
            return ssc.createMsg(keystore, null, {
                type: 'pin',
                text
            })
                .then(msg => {
                    return fetch(BASE + '/api/pin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ msg })
                    })
                })

        },

        getPins: function () {

        }
    }

    return client
}
