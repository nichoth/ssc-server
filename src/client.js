// require('dotenv').config()
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc/web')
const createHash = require('create-hash')
// var Blake2s = require('blake2s')
const { SERVER_PUB_KEY } = require('./config.json')

var baseUrl = 'http://localhost:8888'
var BASE = (process.env.NODE_ENV === 'test' ? baseUrl : '')

// this is a client-side file that calls our API

module.exports = function Client (_keystore) {
    var keystore = _keystore

    const client = {
        getProfile: _getProfile,

        setKeystore: function (ks) {
            keystore = ks
            return client
        },

        serverFollows: function (userDid) {
            const a = ssc.publicKeyToDid(SERVER_PUB_KEY)
            const b = userDid
            const qs = new URLSearchParams({ a, b }).toString()
            var url = (BASE + '/api/follow' + '?' + qs)

            return fetch(url)
                .then(res => {
                    return res.text()
                    // if (!res.ok) return res.text()
                    // res.json()
                })
                .then(json => {
                    console.log('jsonnnnnnn', json)
                    return json
                })
        },

        // must pass a username
        // image is optional (should use existing image if there is not a new one)
        // imgHash should be the existing profile image hash
        postProfile: function ({ username, imgHash, image, desc }) {
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
                console.log('*did in posting*', did)

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
                        .then(res => {
                            if (!res.ok) return res.text().then(text => {
                                throw new Error(text)
                            })

                            return res.json()
                        })
                })
            })
        },

        createAlternateDid: function ({ newKeystore }) {
            if (!newKeystore) return Promise.reject(new Error('Missing keystore'))

            // create a msg signed by the old DID
            return ssc.getDidFromKeys(keystore)
                .then(oldDid => {
                    return ssc.getDidFromKeys(newKeystore)
                        .then(newDid => {
                            console.log('old, new', { oldDid, newDid })
                            return { oldDid, newDid }
                        })
                })
                .then(({ newDid, oldDid }) => {
                    // create a msg from oldDid that says
                    // "newDid is an alternate ID for me"
                    // (we sign with the existing `keystore` here)
                    return ssc.createMsg(keystore, null, {
                        type: 'alternate',
                        from: oldDid,
                        to: newDid
                    })
                })
                .then(msg => {
                    // post the 'alternate' message
                    // server-side -- need to check that the message is valid,
                    //   and check that we are following the oldDid
                    return fetch(BASE + '/api/alternate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(msg)
                    })
                })
                .then(res => {
                    if (!res.ok) return res.text().then(text => {
                        throw new Error(text)
                    })

                    return res.json()
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
                    if (!res.ok) return res.text().then(text => {
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

module.exports.GetProfile = _getProfile

function _getProfile (did) {
    const qs = new URLSearchParams({ did }).toString()
    var url = (BASE + '/api/profile' + '?' + qs)
    return fetch(url)
        .then(res => {
            if (!res.ok) return res.text().then(text => {
                throw new Error(text)
            })

            return res.json()
        })
}
