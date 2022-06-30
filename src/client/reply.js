require('dotenv').config()
require('isomorphic-fetch')
// const { getHash } = require('@nichoth/multihash')
const BASE = (process.env.NODE_ENV === 'test' ?
    'http://localhost:8888' :
    '')

// gets all pending redemptions
// this means, get all invitees that you need to follow
module.exports = {
    post: async function postReply (ssc, keys, prev, content) {

        if (!content.replyTo) {
            return Promise.reject(new Error('must include a replyTo message'))
        }

        if (!content.text) {
            return Promise.reject(new Error('must include content.text'))
        }

        const msg = await ssc.createMsg(keys, (prev || null),
            Object.assign({}, content, { type: 'reply' }))
        
        return fetch(BASE + '/api/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg)
        })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(text => {
                        throw new Error(text)
                    })
                }

                return res.json()
            })


    }
}