require('dotenv').config()
require('isomorphic-fetch')
const BASE = (process.env.NODE_ENV === 'test' ?
    'http://localhost:8888' :
    '')
const { v4: uuidv4 } = require('uuid')

module.exports = {
    create: async function createInvitation (ssc, keys, msgContent) {

        const did = await ssc.getDidFromKeys(keys)

        const _msgContent = Object.assign({}, msgContent, {
            type: 'invitation',
            code: did + '--' + uuidv4()
        })

        const msg = await ssc.createMsg(keys, null, _msgContent)

        return fetch(BASE + '/api/invitation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg)
        })
            .then(res => {
                if (res.ok) return res.json()

                return res.text().then(text => {
                    throw new Error(text)
                })
            })
    }
}
