const faunadb = require('faunadb')
const ssc = require('@nichoth/ssc-lambda')
const { admins } = require('../../../src/config.json')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod === 'GET') {
        // query the DB and return pins
        return q.Map(
            q.Paginate(q.Documents(q.Collection('pins'))),
            q.Lambda(x => q.Get(x))
        ).then(res => {
            return {
                statusCode: 200,
                body: JSON.stringify(res)
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

        console.log('**got a post pin req**', msg)

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

        const isAdmin = (admins || []).find(user => user.did === did)
        isVal = isVal && isAdmin

        if (!isVal) {
            return {
                statusCode: 400,
                body: 'invalid message'
            }
        }

        const key = ssc.getId(key)

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
