// require('dotenv').config()
require('isomorphic-fetch')
var ssc = require('@nichoth/ssc/web')
var createHash = require('create-hash')
// var Blake2s = require('blake2s')

var baseUrl = 'http://localhost:8888'
var BASE = (process.env.NODE_ENV === 'test' ? baseUrl : '')

// this is a client-side file that calls our API

module.exports = function Client (_keystore) {
    var keystore = _keystore

    const client = {
        getProfile: function getProfile (did) {
            const qs = new URLSearchParams({ did }).toString()
            var url = (BASE + '/api/profile' + '?' + qs)
            return fetch(url)
        },

        setKeystore: function (ks) {
            keystore = ks
            return client
        },

        // must pass a username
        // image is optional (should use existing image if there is not a new one)
        // imgHash should be the existing profile image hash
        postProfile: function ({ did, username, imgHash, image, desc }) {
            if (!username) return Promise.reject(
                new Error('must include username'))

            if (!imgHash && !image) return Promise.reject(
                new Error('must include an image or a hash for an existing image')
            )

            // if we are passed an image, set _hash to the right hash
            var hash = imgHash
            if (image) {
                // let _hash = new Blake2s()
                let _hash = createHash('sha256')
                _hash.update(image)
                hash = _hash.digest('base64')
                // hash = _hash.digest()
            }
            
            return ssc.getDidFromKeys(keystore).then(did => {
                return ssc.createMsg(keystore, null, {
                    type: 'about',
                    about: did,
                    username,
                    desc: desc || null,
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
                        .then(res => res.json())
                })
            })
        },

        createNewProfile: function ({ newKeystore, username, image }) {
            if (!newKeystore || !username || !image) {
                return Promise.reject(new Error('Missing something'))
            }

            const oldDid = keystore

            return ssc.createMsg(keystore, null, {
                type: 'alternate',
                from: '',
                newDid: ''
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
                        body: JSON.stringify(msg)
                    })
                })
                .then(res => {
                    if (!res.ok) res.text().then(text => {
                        throw new Error(text)
                    })

                    return res.json()
                })
                .then(json => json.data)

        },

        getPin: function () {
            return fetch(BASE + '/api/pin')
                .then(res => {
                    if (!res.ok) res.text().then(text => {
                        throw new Error(text)
                    })

                    return res.json()
                })
        }
    }

    return client
}
