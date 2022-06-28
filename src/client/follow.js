require('dotenv').config()
require('isomorphic-fetch')

const BASE = (process.env.NODE_ENV === 'test' ?
    'http://localhost:8888' :
    '')

module.exports = {
    get: function (did) {
        const qs = new URLSearchParams({ did }).toString()
        const url = (BASE + '/api/follow' + '?' + qs)

        return fetch(url)
            .then(res => {
                if (res.ok) return res.json()

                return res.text().then(text => {
                    throw new Error(text)
                })
            })
    },

    post: function (ssc, keys, contact) {
        ssc.createMsg(keys, null, {
            type: 'follow',
            contact
        }).then(msg => {
            return fetch(BASE + '/.netlify/functions/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([msg])
            })
        })
        .then(res => {
            if (!res.ok) {
                res.text().then(text => {
                    t.fail(text)
                    t.end()
                })
            }
            return res.json()
        })
    }
}
