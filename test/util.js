const { v4: uuidv4 } = require('uuid')
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc-lambda')
const BASE = 'http://localhost:8888'

module.exports = {
    inviteAndFollow
}

function inviteAndFollow ({ adminKeys, user }) {
    const code = uuidv4()

    return ssc.createMsg(adminKeys, null, { type: 'invitation', code })
        .then(msg => {
            return fetch(BASE + '/api/invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            })
        })
        .then(res => {
            return ssc.createMsg(user.keys, null, {
                type: 'redeem-invitation',
                code
            })
        })
        .then(msg => {
            return fetch(BASE + '/api/redeem-invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            })
        })
}
