
const faunadb = require('faunadb')
const q = faunadb.query
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

exports.handler = function (ev, ctx) {
    if (ev.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: 'invalid http method'
        }
    }

    const did = ev.queryStringParameters.did

    return getWithFoafs(did)
        .then(res => {
            return {
                statusCode: 200,
                body: JSON.stringify(res.data.map(_doc => {
                    return _doc.data
                }))
            }
        })
        .catch(err => {
            console.log('errrrrrrrrrr', err)
            return {
                statusCode: 500,
                body: err.toString()
            }
        })
}

// todo -- need to be sure to get *your own* posts in this request

function getWithFoafs (did) {

    // Join takes a list of something and an index

    return client.query(
        q.Map(
            q.Paginate(
                q.Reverse(
                    q.Union(
                        // this gets posts from everyone *you are following*,
                        // 1 hop out
                        q.Join(
                            q.Match("following_contact", did),
                            q.Index("post_by_author")
                        ),
                        // this gets the foaf posts
                        q.Join(
                            q.Join(
                                // need to take everyone you are following,
                                // and get *their* contacts
                                q.Match( q.Index("following_contact"), did ),
                                q.Index("following_contact")
                            ),
                            // then get posts from foafs
                            q.Index("post_by_author")
                        )
                    )
                )
            ),
            
            q.Lambda("post", q.Get(q.Var("post")))
        )
    )
}
