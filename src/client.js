// require('dotenv').config()
require('isomorphic-fetch')
var ssc = require('@nichoth/ssc/web')
var createHash = require('create-hash')

var baseUrl = 'http://localhost:8888'
var BASE = (process.env.NODE_ENV === 'test' ?  baseUrl : '')

// this is a client-side file that calls our API

module.exports = function Client (keystore) {

    const client = {
        getProfile: function getProfile (did) {
            const qs = new URLSearchParams({ did }).toString()
            var url = (BASE + '/.netlify/functions/profile' + '?' + qs)
            return fetch(url)
        },

        // must pass a username
        // image is optional (should use existing image if there is not a new one)
        postProfile: function (did, username, image) {
            if (!username) return Promise.reject(
                new Error('must include username'))

            var hash = createHash('sha256')
            hash.update(image)
            var _hash = hash.digest('base64')

            return ssc.createMsg(keystore, null, {
                type: 'about',
                about: did,
                username,
                image: (_hash || null)
            }).then(msg => {
                return fetch(BASE + '/.netlify/functions/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        did,
                        msg,
                        file: image
                    })
                })
            })
        }
    }

    return client
}
