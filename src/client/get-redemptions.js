require('dotenv').config()
require('isomorphic-fetch')
const BASE = (process.env.NODE_ENV === 'test' ?
    'http://localhost:8888' :
    '')

// gets all pending redemptions
// this means, get all invitees that you need to follow
module.exports = function getRedemptions (did) {
    const qs = new URLSearchParams({ did }).toString()
    const url = (BASE + '/api/redemption' + '?' + qs)

    return fetch(url).then(res => {
        if (!res.ok) {
            return res.text().then(text => {
                throw new Error(text)
            })
        }

        return res.json()
    })
}
