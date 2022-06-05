require('dotenv').config()
// const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
// var createHash = require('create-hash')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: 'invalid http method'
        }
    }

    const did = ev.queryStringParameters.did

    return client.query(
        q.Get(q.Match(q.Index('redemption-by-inviter'), did))
    )
        .then(doc => {
            return {
                statusCode: 200,
                body: JSON.stringify(doc.data)
            }
        })
        .catch(err => {
            if (err.toString().includes('not found')) {
                return {
                    statusCode: 404,
                    body: 'no redemptions waiting'
                }
            }

            return {
                statusCode: 500,
                body: err.toString()
            }
        })
}
