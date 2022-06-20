require('dotenv').config()
require('isomorphic-fetch')
const BASE = (process.env.NODE_ENV === 'test' ?
    'http://localhost:8888' :
    '')
const { getHash } = require('@nichoth/multihash')

// gets all pending redemptions
// this means, get all invitees that you need to follow
module.exports = {
    create: async function createPost (ssc, keys, { files, content, prev }) {
        const mentions = files.map(file => {
            return getHash(file)
        })

        const msg = await ssc.createMsg(keys, (prev || null),
            Object.assign({ type: 'post', mentions }, content))
        
        return fetch(BASE + '/api/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files, msg })
        })
            .then(res => {
                if (!res.ok) {
                    res.text().then(text => {
                        throw new Error(text)
                    })
                }

                return res.json()
            })
    }
}
