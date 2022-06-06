const faunadb = require('faunadb')
const ssc = require('@nichoth/ssc-lambda')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const { admins } = require('../../../src/config.json')
const { PUBLIC_KEY } = process.env

const serverDid = ssc.publicKeyToDid(PUBLIC_KEY)

// TODO -- add DB queries
exports.handler = async function (ev, ctx) {
    if (ev.httpMethod === 'GET') {
        const author = ev.queryStringParameters.author
        const a = ev.queryStringParameters.a
        const b = ev.queryStringParameters.b

        if (author) {
            return {
                statusCode: 200,
                body: 'get who this author is following'
            }
        }

        if (a && b) {
            // is the server following `b`?
            const isServer = a === serverDid
            const isAdmin = admins.some(admin => admin.did === b)

            if (isServer && isAdmin) {
                return { statusCode: 200, body: JSON.stringify(true) }
            }

            return client.query(
                q.IsEmpty(q.Match(
                    q.Index('a_follows_b'),
                    [ a, b ]
                ))
            )
                .then(res => {
                    return {
                        statusCode: 200,
                        body: JSON.stringify(!res)
                    }
                })
        }

        return {
            statusCode: 422,
            body: 'missing query parameter'
        }
    }

    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'invalid http method'
        }
    }

    // *is a POST request*
    // var msg
    // takes a stringified array of 'follow' msgs as a body
    // must be a list b/c we need may need to follow
    // multiple people when we deal with the pending queue of redemptions
    var msgs
    try {
        msgs = JSON.parse(ev.body)
    } catch(err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    if (!Array.isArray(msgs)) return {
        statusCode: 422,
        body: 'invalid messages'
    }

    const isValids = await Promise.all(msgs.map(msg => {
        // const pubKey = ssc.didToPublicKey(msg.author)
        const { publicKey } = ssc.didToPublicKey(msg.author)
        // return ssc.isValidMsg(msg, null, pubKey)
        return ssc.isValidMsg(msg, null, publicKey)
    }))

    // console.log('is valids', isValids)

    const isOk = isValids.every(Boolean)

    if (!isOk) {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    // check that the author is the same for all messages
    const authorDid = msgs[0].author
    const authorOk = msgs.every(msg => (msg.author === authorDid))
    if (!authorOk) {
        return {
            statusCode: 422,
            body: 'invalid author'
        }
    }

    // all msgs are valid at this point
    // should check if the server is following the author
    const isAdmin = admins.some(admin => admin.did === authorDid)
    const serverIsFollowing = !(await client.query(
        q.IsEmpty(q.Match(
            q.Index('a_follows_b'),
            [ serverDid, authorDid ]
        ))
    ))

    if (!serverIsFollowing && !isAdmin) {
        return {
            statusCode: 403,
            body: 'not following you'
        }
    }

    const formattedMsgs = msgs.map(msg => {
        return { key: ssc.getId(msg), value: msg }
    })

    return client.query(
        q.Map(
            formattedMsgs,
            q.Lambda(["msg"], q.Create(q.Collection('follow'), {
                data: q.Var("msg")
            }))
        )
    )
        .then(res => {
            return {
                statusCode: 200,
                body: JSON.stringify(res.map(item => item.data))
            }
        })





    // return Promise.all(msgs.map(msg => {
    //     if (msg.content.type !== 'follow' || !msg.content.contact ||
    //         !msg.author) {
    //             return Promise.reject(new Error('invalid message'))
    //     }

    //     const pubKey = ssc.didToPublicKey(msg.author)
    //     return ssc.isValidMsg(msg, null, pubKey)
    // }))
    //     .then(vals => {
    //         return vals.some(val => (!val))
    //     })
    //     .then(writes => {

    //     })
    //     .catch(err => {
    //         return {
    //             statusCode: 422,
    //             body: err.toString()
    //         }
    //     })




    // try {
    //     const body = JSON.parse(ev.body)
    //     msg = body.msg
    // } catch (err) {
    //     return {
    //         statusCode: 422,
    //         body: 'invalid json'
    //     }
    // }

    // const badMsg = (msg.content.type !== 'follow' || !msg.content.contact ||
    //     !msg.author)

    // if (badMsg) {
    //     return {
    //         statusCode: 400,
    //         body: 'invalid message'
    //     }
    // }

    // const pubKey = ssc.didToPublicKey(msg.author)

    // validate the given message
    // return ssc.isValidMsg(msg, null, pubKey).then(isVal => {
    //     if (!isVal) {
    //         return {
    //             statusCode: 400,
    //             body: 'invalid message'
    //         }
    //     }

    //     // a query that writes the given 'follow' message to the DB
    //     return client.query(
    //         q.Create(q.Collection('follow'), {
    //             data: {
    //                 key: ssc.getId(msg),
    //                 value: msg
    //             }
    //         })
    //     )
    //         .then(res => {
    //             return {
    //                 statusCode: 200,
    //                 body: JSON.stringify(res.data)
    //             }
    //         })
    //         .catch(err => {
    //             console.log('oh no', err)
    //             throw err
    //         })
    // })
}
