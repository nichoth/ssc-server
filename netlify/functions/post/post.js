require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
const { getLatest } = require('./feed')
const serverFollows = require('../server-follows')
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
    var lastMsg

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

        // msg is valid, so check if the server follows this user
        if (admins.some(admin => admin.did === did)) {
            // is an admin, so add it to DB
            const key = ssc.getId(msg)

            return writePost(key, msg)
                .then(res => {
                    return {
                        statusCode: 201,
                        body: JSON.stringify(res.data)
                    }
                })
        }

        return serverFollows(did)
            .then(follows => {
                if (follows) {
                    // server does follow them, write the post
                    const key = ssc.getId(msg)
                    return writePost(key, msg)
                        .then(res => {
                            return {
                                statusCode: 200,
                                body: JSON.stringify(res.data)
                            }
                        })
                }

                return {
                    statusCode: 403,
                    body: 'not allowed'
                }
            })
    })
        .catch((err) => {
            return {
                statusCode: 400,
                body: 'invalid signature'
            }
        })
}

function writePost (key, msg) {
    return client.query(
        q.Create(
            q.Collection('posts'),
            { data: { key, value: msg } },
        )
    )
}
