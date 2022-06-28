require('dotenv').config()
require('isomorphic-fetch')
// const { getHash } = require('@nichoth/multihash')
const BASE = (process.env.NODE_ENV === 'test' ?
    'http://localhost:8888' :
    '')

module.exports = {
    get: function (did) {
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

    getByName: function (username) {
        const qs = new URLSearchParams({ username }).toString()
        const url = (BASE + '/api/feed' + '?' + qs)

        return fetch(url)
            .then(res => {
                if (res.ok) return res.json()

                return res.text().then(text => {
                    throw new Error(text)
                })
            })
    }
}
