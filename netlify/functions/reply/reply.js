require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
const serverFollows = require('../server-follows')
const q = faunadb.query
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const { admins } = require('../../../src/config.json')

// admin vs new user vs server


exports.handler = function (ev, ctx) {
    if (ev.httpMethod !== 'POST') return {
        statusCode: 405,
        body: 'bad http method'
    }

    var msg
    try {
        msg = JSON.parse(ev.body)
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    const did = ssc.getAuthor(msg)
    const pubKey = ssc.didToPublicKey(did).publicKey
    const lastMsg = null

    return ssc.isValidMsg(msg, lastMsg, pubKey)
        .then(isVal => {
            if (!isVal) return {
                statusCode: 400,
                body: 'invalid message'
            }

            // if they are an admin, the write the reply
            if (admins.some(admin => admin.did === did)) {
                return writeMsg(ssc.getId(msg), msg)
                    .then(res => {
                        return {
                            statusCode: 200,
                            body: JSON.stringify(res)
                        }
                    })
            }

            return serverFollows(did)
                .then(follows => {
                    if (!follows) {
                        console.log('followwwwwwwwwwwws', follows, did)

                        return {
                            statusCode: 403,
                            body: 'not allowed'
                        }
                    }

                    // server does follow them, write the post
                    const key = ssc.getId(msg)
                    return writeMsg(key, msg)
                })
                .then(msg => {
                    return {
                        statusCode: 200,
                        body: JSON.stringify(msg)
                    }
                })
                .catch(err => {
                    return {
                        statusCode: 500,
                        body: err.toString()
                    }
                })
        })
}

function writeMsg (key, msg) {
    return client.query(
        q.Create(
            q.Collection('reply'),
            { data: { key, value: msg } }
        )
    )
        .then(res => {
            return Object.assign(res.data, {
                value: Object.assign(res.data.value, {
                    previous: (res.data.value.previous || null)
                })
            })
        })
}
