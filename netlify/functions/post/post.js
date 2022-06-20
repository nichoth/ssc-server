require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
const { getLatest } = require('./feed')
const serverFollows = require('../server-follows')
// var createHash = require('create-hash')
// const upload = require('../upload')
const { getHash } = require('@nichoth/multihash')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const { admins } = require('../../../src/config.json')
const upload = require('../upload')


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


    if (!msg.content.mentions){
        return {
            statusCode: 400,
            body: 'you need to send `mentions` in the message'
        }
    }

    const { mentions } = msg.content

    // test that each mention is the hash for a file
    // (file and mention arrays need to be in the same order)
    const hashesOk = mentions.reduce((isOk, mention, i) => {
        return (isOk && (getHash(files[i]) === mention))
    }, true)

    if (!hashesOk) {
        return {
            statusCode: 422,
            body: 'invalid file hash'
        }
    }



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

            return writePost(key, msg, files)
                .then((writes) => {
                    return {
                        statusCode: 201,
                        body: JSON.stringify(writes[writes.length - 1])
                    }
                })
        }

        return serverFollows(did)
            .then(follows => {
                if (follows) {
                    // server does follow them, write the post
                    const key = ssc.getId(msg)
                    return writePost(key, msg, files)
                        .then((writes) => {
                            return {
                                statusCode: 200,
                                body: JSON.stringify(writes[writes.length - 1])
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




function writePost (key, msg, files) {
    return Promise.all(
        msg.content.mentions.map((mention, i) => {
            return upload(files[i], mention)
        }).concat([
            client.query(
                q.Create(
                    q.Collection('posts'),
                    { data: { key, value: msg } },
                )
            ).then(res => res.data)
        ])
    )
}
