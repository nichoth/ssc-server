require('dotenv').config()
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc/web')
const { getHash } = require('@nichoth/multihash')
const { SERVER_PUB_KEY } = require('../config.json')
const getRedemptions = require('./get-redemptions')
const Post = require('./post')
const Invitation = require('./invitation')
const Alternate = require('./alternate')

const BASE = (process.env.NODE_ENV === 'test' ? 'http://localhost:8888' : '')

// this is a client-side file that calls our API

module.exports = function Client (_keystore) {
    var keystore = _keystore

    const client = {
        getProfile: _getProfile,

        setKeystore: function (ks) {
            keystore = ks
            return client
        },

        getPost: function (key) {
            return Post.get(key)
        },

        createPost: function ({ files, content, prev }) {
            return Post.create(ssc, keystore, { files, content, prev })
        },

        getFeed: function (did) {
            const qs = new URLSearchParams({ did }).toString()
            const url = (BASE + '/api/feed' + '?' + qs)

            return fetch(url)
                .then(res => {
                    if (res.ok) return res.json()

                    return res.text().then(text => {
                        throw new Error(text)
                    })
                })
        },

        getRelevantPosts: function (did) {
            const qs = new URLSearchParams({ did }).toString()
            const url = (BASE + '/api/relevant-posts' + '?' + qs)

            return fetch(url)
                .then(res => {
                    if (res.ok) {
                        return res.json()
                    }

                    return res.text().then(text => {
                        console.log('relevnt errrrrrrrrrrr', text)
                        throw new Error(text)
                    })
                })
        },

        followViaInvitation: function (did) {
            return Promise.all(did.map(did => {
                return ssc.createMsg(keystore, null, {
                    type: 'follow',
                    contact: did
                })
            }))
                .then(msgs => {
                    return fetch(BASE + '/api/follow-via-invitation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(msgs)
                    })
                })
                .then(res => {
                    if (res.ok) return res.json()

                    res.text().then(text => {
                        throw new Error(text)
                    })
                })
        },

        // get a list of who this user is following
        getFollowing: function (did) {
            const qs = new URLSearchParams({ did }).toString()
            const url = (BASE + '/api/following' + '?' + qs)

            return fetch(url)
                .then(res => {
                    if (res.ok) return res.json()

                    res.text().then(text => {
                        throw new Error(text)
                    })
                })
        },

        follow: function (dids) {
            return Promise.all(dids.map(did => {
                return ssc.createMsg(keystore, null, {
                    type: 'follow',
                    contact: did
                })
            }))
                .then(msgs => {
                    return fetch(BASE + '/api/follow', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(msgs)
                    })
                })
                .then(res => {
                    if (res.ok) {
                        return res.json()
                    }

                    res.text().then(text => {
                        throw new Error(text)
                    })
                })
        },

        getRedemptions: getRedemptions,

        createInvitation: function (keys, content) {
            const did = ssc.getDidFromKeys(keys)
            return Invitation.create(ssc, keys, Object.assign({}, content, {
                code: '' 
            }))
        },

        // redeem: function redeemInvitation (ssc, keys, code, content) {
        redeemInvitation: function (keys, code, content) {
            return Invitation.redeem(ssc, keys, code, content)
        },

        serverFollows: function (userDid) {
            const a = ssc.publicKeyToDid(SERVER_PUB_KEY)
            const b = userDid
            const qs = new URLSearchParams({ a, b }).toString()
            const url = (BASE + '/api/follow' + '?' + qs)

            return fetch(url)
                .then(res => {
                    // return res.text()
                    if (!res.ok) {
                        res.text().then(text => {
                            throw new Error(text)
                        })
                    }

                    return res.json()
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
                // let _hash = createHash('sha256')
                // _hash.update(image)
                hash = getHash(image)
                // hash = _hash.digest('base64')
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
                        .then(res => {
                            if (!res.ok) return res.text().then(text => {
                                throw new Error(text)
                            })

                            return res.json()
                        })
                })
            })
        },

        createAlternateDid: function ({ newKeystore, profile }) {
            return Alternate.create({ ssc, keystore, newKeystore, profile })
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

