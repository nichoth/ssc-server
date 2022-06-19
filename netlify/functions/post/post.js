require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
const { getLatest } = require('./feed')
// var createHash = require('create-hash')
// const upload = require('../upload')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const { admins } = require('../../../src/config.json')


exports.handler = async function (ev, ctx) {
    if (ev.httpMethod !== 'POST') return {
        statusCode: 405,
        body: 'bad http method'
    }

    // is a POST request
    var msg, files
    try {
        const body = JSON.parse(ev.body)
        msg = body.msg
        files = body.files
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    const did = ssc.getAuthor(msg)

    // validate the message sig with the given author
    const pubKey = ssc.didToPublicKey(did).publicKey
    // var isVal
    var lastMsg

    // console.log('*incoming msg*', msg)
    // console.log('pub key', pubKey)

    try {
        lastMsg = (await getLatest(did)).value
    } catch (err) {
        if (err.toString().includes('instance not found')) {
            lastMsg = null
        } else {
            throw err
        }
    }

    return ssc.isValidMsg(msg, lastMsg, pubKey).then(isVal => {
        if (!isVal) {
            return {
                statusCode: 400,
                body: 'invalid signature'
            }
        }

        // msg is valid, so add it to the DB
        if (admins.some(admin => admin.did === did)) {
            // req is from an admin, add it to DB
            const key = ssc.getId(msg)

            return client.query(
                q.Create(
                    q.Collection('posts'),
                    { data: { key, value: msg } },
                )
            )
                .then(res => {
                    return {
                        statusCode: 200,
                        body: JSON.stringify(res.data)
                    }
                })
        }

        // check if server is following the user
    })
        .catch(() => {
            return {
                statusCode: 400,
                body: 'invalid signature'
            }
        })

}