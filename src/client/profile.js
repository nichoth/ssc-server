require('dotenv').config()
require('isomorphic-fetch')
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
    }
}