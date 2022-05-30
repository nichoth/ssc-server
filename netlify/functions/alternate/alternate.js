const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const { admins } = require('../../../src/config.json')
const { PUBLIC_KEY } = process.env

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'invalid method'
        }
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

    try {
        var { publicKey } = ssc.didToPublicKey(msg.author)
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid message author'
        }
    }

    var isVal
    try {
        isVal = await ssc.isValidMsg(msg, null, publicKey)
    } catch (err) {
        return {
            statusCode: 422,
            body: 'errrrr invalid message errr'
        }
    }

    if (!isVal) {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    if (!msg.content.from || !msg.content.to) {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    const did = ssc.getAuthor(msg)

    if (!(did === msg.content.from)) {
        return {
            statusCode: 400,
            body: 'invalid message'
        }
    }

    const key = ssc.getId(msg)

    // if is an admin, create an alt
    if (admins.some(el => el.did === did)) {
        return client.query(
            q.Create(
                q.Collection('alternate'),
                { data: { key, value: msg } }
            )
        ).then(res => {
            res.data.value.previous = (res.data.value.previous || null)

            return {
                statusCode: 200,
                body: JSON.stringify(res.data)
            }
        })
    }


    // here we check if the user is somone we follow,
    // and if so, then we create the alt for them
    return client.query(
        q.If(
            q.IsEmpty(q.Match(
                q.Index('a_follows_b'),
                [ ssc.publicKeyToDid(PUBLIC_KEY), did ]
            )),
            // is empty, means the server doesn't follow them
            'empty',

            // is not empty, so we write the 'alternate' message to DB
            q.Create(
                q.Collection('alternate'),
                { data: { key, value: msg } }
            )
        )
    )
        .then(doc => {
            if (doc === 'empty') {
                return {
                    statusCode: 403,
                    body: 'not allowed'
                }
            }

            return {
                statusCode: 200,
                body: JSON.stringify(doc.data)
            }
        })
        .catch(err => {
            if (err.toString().includes('instance not found')) {
                console.log('*not found*')
                return {
                    statusCode: 400,
                    body: 'not allowed'
                }
            }
            return {
                statusCode: 500,
                body: 'oh no'
            }
        })

}
