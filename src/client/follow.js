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

    unFollow: function (ssc, keys, dids) {
        return Promise.all(dids.map(did => {
            return ssc.createMsg(keys, null, {
                type: 'unfollow',
                contact: did
            })
        }))
            .then(msgs => {
                return fetch(BASE + '/api/unfollow', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(msgs)
                })
            })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(text => {
                        throw new Error(text)
                    })
                }
                return res.json()
            })
    },

    post: function (ssc, keys, contacts) {
        return Promise.all(contacts.map(contact => {
            return ssc.createMsg(keys, null, {
                type: 'follow',
                contact
            })
        }))
            .then(msgs => {
                return fetch(BASE + '/api/follow', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(msgs)
                })
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
