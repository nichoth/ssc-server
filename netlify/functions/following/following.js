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

    if (!did) return {
        statusCode: 422,
        body: 'need the DID in a query parameter'
    }

    return client.query(
        q.Paginate( q.Match(q.Index('following'), did) )
    )
        .then(res => {
            return {
                statusCode: 200,
                body: JSON.stringify(res.data)
            }
        })
}
