require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const { admins } = require('../../../src/config.json')

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'invalid http method'
        }
    }

    // msgs is 'follow' msgs
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
        const { publicKey } = ssc.didToPublicKey(msg.author)
        return ssc.isValidMsg(msg, null, publicKey)
    }))

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

    const isAdmin = admins.some(admin => admin.did === authorDid)
    if (!isAdmin) {
        return {
            statusCode: 403,
            body: 'you cant do that yet'
        }
    }

    // now update the DB
    const formattedMsgs = msgs.map(msg => {
        return { key: ssc.getId(msg), value: msg }
    })

    return client.query(
        q.Do(
            // write 'follow' msgs
            // and delete the 'redemption' msgs
            formattedMsgs.map(msg => {
                return q.Create(q.Collection('follow'), {
                    data: msg
                })
            }).concat(formattedMsgs.map(msg => {
                // need to get the redemption msg
                return q.Delete(
                    q.Select(
                        ["ref"],
                        q.Get(
                            q.Match(
                                q.Index('redemption-by-redeemer'),
                                msg.value.content.contact
                            )
                        )
                    )
                )
            }))
        )
    )
        .then(res => {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    followMsgs: res.slice(0, formattedMsgs.length).map(item => {
                        return item.data
                    }),
                    redemptionMsgs: res.slice(formattedMsgs.length)
                        .map(item => item.data)
                })
            }
        })
}
