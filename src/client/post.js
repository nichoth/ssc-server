require('dotenv').config()
require('isomorphic-fetch')
const { blobHash } = require('../util')
const BASE = (process.env.NODE_ENV === 'test' ?
    'http://localhost:8888' :
    '')

// gets all pending redemptions
// this means, get all invitees that you need to follow
module.exports = {
    create: async function createPost (ssc, keys, { files, content, prev }) {
        const mentions = files.map(file => {
            return blobHash(file)
        })

        console.log('mentionssssssssss', mentions)

        const msg = await ssc.createMsg(keys, (prev || null),
            Object.assign({ type: 'post', mentions }, content))
        
        return fetch(BASE + '/api/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files, msg })
        })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(text => {
                        throw new Error(text)
                    })
                }

                return res.json()
            })
    },

    get: function getPost (key) {
        const qs = new URLSearchParams({ key }).toString()
        const url = (BASE + '/api/post' + '?' + qs)

        return fetch(url)
            .then(res => {
                if (res.ok) return res.json()

                return res.text().then(text => {
                    throw new Error(text)
                })
            })
    },

    getWithReplies: function withReplies (key) {
        const qs = new URLSearchParams({ replies: true, key }).toString()
        const url = (BASE + '/api/post' + '?' + qs)

        return fetch(url)
            .then(res => {
                if (res.ok) return res.json()

                return res.text().then(text => {
                    throw new Error(text)
                })
            })
    }
}
