require('dotenv').config()
const faunadb = require('faunadb')
const ssc = require('@nichoth/ssc-lambda')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const { admins } = require('../../../src/config.json')
const { PUBLIC_KEY } = process.env

const serverDid = ssc.publicKeyToDid(PUBLIC_KEY)

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod === 'GET') {
        const a = ev.queryStringParameters.a
        const b = ev.queryStringParameters.b

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

}
