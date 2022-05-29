const { v4: uuidv4 } = require('uuid')
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc-lambda')

module.exports = {
    inviteAndFollow
}

function inviteAndFollow ({ adminKeys, user }) {
    const code = uuidv4()

    ssc.createMsg(adminKeys, null, { type: 'invitation', code })
        .then(msg => {
            return fetch(BASE + '/.netlify/functions/invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            })
        })
        .then(() => {
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
