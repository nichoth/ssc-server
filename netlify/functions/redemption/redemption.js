require('dotenv').config()
const faunadb = require('faunadb')
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
        q.Map(
            q.Paginate(q.Match(q.Index('redemption-by-inviter'), did)),
            q.Lambda(x => q.Get(x))
        )
    )
        .then(docs => {
            return {
                statusCode: 200,
                body: JSON.stringify(docs.data.map(doc => doc.data))
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
