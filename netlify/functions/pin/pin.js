const faunadb = require('faunadb')
const ssc = require('@nichoth/ssc-lambda')
const { admins } = require('../../../src/config.json')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

// we just allow posting text here
// @TODO -- should allow posting image

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod === 'GET') {
        // query the DB and return pins
        return client.query(
            q.Map(
                q.Paginate(q.Documents(q.Collection('pin'))),
                q.Lambda(x => q.Get(x))
            )
        ).then(res => {
            return {
                statusCode: 200,
                body: JSON.stringify(Array.isArray(res.data) ?
                    res.data.map(d => d.data)[0] :
                    res
                )
            }
        })
        .catch(err => {
            return {
                statusCode: 404,
                body: err.toString()
            }
        })
    }

    if (ev.httpMethod === 'POST') {
        // post the given msg to the DB
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

        var isVal
        try {
            isVal = await ssc.isValidMsg(msg, null, pubKey)
        } catch (err) {
            return {
                statusCode: 400,
                body: 'invalid message'
            }
        }

        if (!isVal) {
            return {
                statusCode: 400,
                body: 'invalid message'
            }
        }

        const isAdmin = (admins || []).find(user => user.did === did)

        if (!isAdmin) {
            return {
                statusCode: 403,
                body: 'not allowed'
            }
        }

        const key = ssc.getId(msg)

        // msg is valid; handle the post request
        return client.query(
            q.If(
                q.IsEmpty(
                    q.Documents(q.Collection('pin'))
                    // q.Match(q.Index('pins'))
                ),
                q.Create(
                    q.Collection('pin'),
                    { data: { key, value: msg } },
                ),
                q.Replace(
                    q.Select('ref', q.Get(
                        q.Documents(q.Collection('pin'))
                        // q.Match(q.Index('pins'), did)
                    )),
                    { data: { key, value: msg } }
                )
            )
        ).then(res => {
            return {
                statusCode: 200,
                body: JSON.stringify(res)
            }
        })
    }

    return {
        statusCode: 400,
        body: 'booo'
    }
}
