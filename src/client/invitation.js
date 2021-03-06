require('dotenv').config()
require('isomorphic-fetch')
const BASE = (process.env.NODE_ENV === 'test' ?
    'http://localhost:8888' :
    '')
const { v4: uuidv4 } = require('uuid')
// const { blobHash } = require('../util')
const { getHash: blobHash } = require('@nichoth/blob-store')

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
    },

    getByDid: function (did) {
        const qs = new URLSearchParams({ did }).toString()
        const url = (BASE + '/api/invitation' + '?' + qs)

        return fetch(url)
            .then(res => {
                if (res.ok) return res.json()

                return res.text().then(text => {
                    throw new Error(text)
                })
            })
    },

    followViaInvitation: function (ssc, keys, dids) {
        return Promise.all(dids.map(did => {
            return ssc.createMsg(keys, null, {
                type: 'follow',
                contact: did
            })
        }))
            .then(msgs => {
                return fetch(BASE + '/api/follow-via-invitation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(msgs)
                })
            })
            .then(res => {
                if (res.ok) return res.json()

                return res.text().then(text => {
                    throw new Error(text)
                })
            })
    },

    getAll: function () {
        return fetch(BASE + '/api/invitation')
            .then(res => {
                if (res.ok) return res.json()

                return res.text().then(text => {
                    throw new Error(text)
                })
            })
    },

    redeem: async function redeemInvitation (ssc, keys, code, content, file) {
        const { did, username } = content
        if (!did || !username) {
            return Promise.reject(new Error('missing an argument'))
        }

        const hash = await blobHash(file)
        const [ inviterDid ] = code.split('--')

        return Promise.all([
            ssc.createMsg(keys, null, {
                type: 'redemption',
                inviter: inviterDid,
                code
            }),

            // need to also follow the inviter
            ssc.createMsg(keys, null, {
                type: 'follow',
                contact: inviterDid
            }),

            // profile msg
            ssc.createMsg(keys, null, {
                type: 'about',
                about: did,
                username,
                desc: null,
                image: hash,
            })
        ])
        .then(([redemption, follow, profile]) => {
            return fetch(BASE + '/api/redeem-invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    redemption,
                    follow,
                    profile,
                    file
                })
            })
        })
        .then(res => {
            if (res.ok) {
                return res.json()
            }
            return res.text().then(text => {
                throw new Error(text)
            })
        })
    }
}
