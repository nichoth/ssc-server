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

    const { did, username } = ev.queryStringParameters

    if (!did && !username) {
        return {
            statusCode: 422,
            body: 'missing a query param'
        }
    }

    var prom
    if (did) {
        prom = client.query(
            q.Map(
                q.Paginate(
                    q.Join(
                        q.Match( q.Index("following_contact"), did ),
                        q.Index("profile_by_did")
                    )
                ),
                
                q.Lambda( "profile", q.Get(q.Var("profile")) )
            )
        )
    } else if (username) {
        prom = client.query(
            q.Map(
                q.Paginate(
                    q.Join(
                        q.Match( q.Index("following_contact"), did ),
                        q.Index("profile_by_did")
                    )
                ),
                
                q.Lambda( "profile", q.Get(q.Var("profile")) )
            )
        )
    }

    return prom
        .then(res => {
            return {
                statusCode: 200,
                body: JSON.stringify(res.data.map(doc => {
                    return doc.data
                }))
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
