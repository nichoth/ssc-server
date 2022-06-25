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

    // working stuff
    return client.query(
        q.Map(
            q.Paginate(
                q.Join(
                    q.Match( q.Index("following_contact"), did ),
                    q.Index("profile-by-did")
                )
            ),
            
            q.Lambda( "profile", q.Get(q.Var("profile")) )
        )
    )
        .then(res => {
            return {
                statusCode: 200,
                body: JSON.stringify(res.data.map(doc => doc.data))
            }
        })
        .catch(err => {
            console.log('errrrrrrrrrrrrrr', err)
            return {
                statusCode: 500,
                body: err.toString()
            }
        })
}
