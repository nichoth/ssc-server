const faunadb = require('faunadb')
const q = faunadb.query
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

exports.handler = function (ev, ctx) {
    if (ev.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: 'method not allowed'
        }
    }

    const { did, username } = ev.queryStringParameters

    if (did) {
        return client.query(
            q.Map(
                q.Paginate(
                    q.Reverse( q.Match(q.Index('post_by_author'), did) )
                ),
                q.Lambda( 'post', q.Get(q.Var('post')) )
            )
        ).then(res => {
            return {
                statusCode: 200,
                body: JSON.stringify(res.data.map(doc => {
                    // this is b/c the DB I think strips out `null`
                    // values from the message objects
                    return Object.assign(doc.data, {
                        value: Object.assign(doc.data.value, {
                            previous: doc.data.value.previous || null
                        })
                    })
                }))
            }
        })
    }

    if (username) {
        // return query by name
    }

    // no username or did
    return {
        statusCode: 422,
        body: 'missing query param'
    }
}
