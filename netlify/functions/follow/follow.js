const faunadb = require('faunadb')
const ssc = require('@nichoth/ssc-lambda')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

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
            return {
                statusCode: 200,
                body: 'get if a follows b'
            }
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

    // *is a post request*
    var msg
    try {
        const body = JSON.parse(ev.body)
        msg = body.msg
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    const badMsg = (msg.content.type !== 'follow' || !msg.content.contact ||
        !msg.author)

    if (badMsg) {
        return {
            statusCode: 400,
            body: 'invalid message'
        }
    }

    const pubKey = ssc.didToPublicKey(msg.author)

    // validate the given message
    return ssc.isValidMsg(msg, null, pubKey).then(isVal => {
        if (!isVal) {
            return {
                statusCode: 400,
                body: 'invalid message'
            }
        }

        // a query that writes the given 'follow' message to the DB
        return client.query(
            q.Create(q.Collection('follow'), {
                data: {
                    key: ssc.getId(msg),
                    value: msg
                }
            })
        )
            .then(res => {
                return {
                    statusCode: 200,
                    body: JSON.stringify(res.data)
                }
            })
            .catch(err => {
                console.log('oh no', err)
                throw err
            })
    })
}
