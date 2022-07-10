require('dotenv').config()
require('isomorphic-fetch')
// const { blobHash } = require('../util')
const { getHash: blobHash } = require('@nichoth/blob-store')
const BASE = (process.env.NODE_ENV === 'test' ? 'http://localhost:8888' : '')

module.exports = {
    getByName: function (username) {
        const qs = new URLSearchParams({ username }).toString()
        const url = (BASE + '/api/profile' + '?' + qs)

        return fetch(url)
            .then(res => {
                if (res.ok) return res.json()

                return res.text().then(text => {
                    throw new Error(text)
                })
            })
    },

    save: async function (ssc, user, prev, profile, file) {
        if (!profile.username) {
            return Promise.reject(new Error('missing username'))
        }

        return ssc.createMsg(user.keys, (prev || null), {
            type: 'about',
            about: user.did,
            username: profile.username,
            desc: profile.desc || null,
            image: await blobHash(file)
        })
            .then(msg => {
                return fetch(BASE + '/api/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        msg,
                        file
                    })
                })
            })
            .then(res => {
                if (res.ok) return res.json()

                return res.text().then(text => {
                    throw new Error(text)
                })
            })
    }
}
