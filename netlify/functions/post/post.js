require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
const { getHash } = require('@nichoth/multihash')
const { admins } = require('../../../src/config.json')
const serverFollows = require('../server-follows')
const upload = require('../upload')
const { getLatest } = require('./feed')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})


exports.handler = async function (ev, ctx) {
    if (ev.httpMethod === 'GET') {
        const postKey = ev.queryStringParameters.key
        const withReplies = !!ev.queryStringParameters.replies

        if (!postKey) {
            return {
                statusCode: 422,
                body: 'missing the `key` query param'
            }
        }

        if (withReplies) {
            return client.query(
                q.Map(
                    q.Paginate(
                        q.Union(
                            q.Match( q.Index("post_by_key"), postKey ),
                            q.Match( q.Index("reply_to"), postKey )
                        )
                    ),

                    q.Lambda("post", q.Get(q.Var("post")))
                )
            )
                .then(res => {
                    return {
                        statusCode: 200,
                        body: JSON.stringify(res.data.map(doc => doc.data))
                    }
                })
                .catch(err => {
                    console.log('errr', err)
                    return {
                        statusCode: 500,
                        body: err.toString()
                    }
                })
        }

        return client.query(q.Get(q.Match(
            q.Index("post_by_key"),
            postKey
        )))
            .then(res => {
                return {
                    statusCode: 200,
                    body: JSON.stringify(res.data)
                }
            })
            .catch(err => {
                return {
                    statusCode: 500,
                    body: err.toString()
                }
            })
    }

    if (ev.httpMethod !== 'POST') return {
        statusCode: 405,
        body: 'bad http method'
    }

    // **is a POST request**
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

    if (!msg.content.mentions) {
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
                        statusCode: 200,
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
            ).then(res => {
                return Object.assign(res.data, {
                    value: Object.assign(res.data.value, {
                        previous: (res.data.value.previous || null)
                    })
                })
            })
        ])
    )
}
