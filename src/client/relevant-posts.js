require('dotenv').config()
require('isomorphic-fetch')

const BASE = (process.env.NODE_ENV === 'test' ?
    'http://localhost:8888' :
    '')

module.exports = {
    get: function (did) {
        const qs = new URLSearchParams({ did }).toString()
        const url = (BASE + '/api/relevant-posts' + '?' + qs)

        return fetch(url)
            .then(res => {
                if (res.ok) return res.json()

                return res.text().then(text => {
                    throw new Error(text)
                })
            })
    }
}
