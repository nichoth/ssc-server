
const faunadb = require('faunadb')
const xtend = require('xtend')
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
            console.log('got with foafs', res)
            return {
                statusCode: 200,
                body: JSON.stringify(res)
            }
        })
        .catch(err => {
            return {
                statusCode: 500,
                body: err.toString()
            }
        })
}





function getFollowing (id) {
    return client.query(
        // get everyone `id` is following
        q.Map(
            q.Paginate(
                q.Reverse( q.Match(q.Index('following'), id) )
            ),
            q.Lambda( 'followMsg', q.Get(q.Var('followMsg')) )
        )
    )
}

function getWithFoafs (id) {
    // return getFriendsAndFoafs(id)
    return getFollowing(id)
        // first we get everyone that `id` is following
        .then(res => {
            console.log('*got following*', res)
            return res.data.map(d => d.data)
        })
        .then(arr => {
            console.log('bbbbbbbbbbbbbbbbb', arr)
            // arr is everyone I'm following
            // if (!arr.length) return Promise.resolve([ {}, {} ])

            var postProm = client.query(
                q.Map(
                    q.Paginate(
                        q.Union(
                            // get the posts for the follow array
                            // include your own id
                            [q.Reverse(q.Match(q.Index('post_by_author'), id))].concat(
                                arr.map(post => {
                                    return q.Reverse(q.Match(q.Index('post_by_author'),
                                        post.value.content.contact))
                                })
                            )
                        )
                    ),
                    q.Lambda('post', q.Get(q.Var('post')))
                )
            )
                .then(res => {
                    console.log('aaaaaaaaaaaaaaaaaaaaaaa', res)
                    return res
                })

            // here we have an array of people you're following
            // the follwed id is
            // [{ value: { content: { contact } }}]
            // we are getting everyone they're following
            var foafProm = (arr.length ?
                client.query(
                    q.Map(
                        q.Paginate(
                            q.Union(
                                arr.map(folMsg => {
                                    return q.Reverse( q.Match(q.Index('following'),
                                        folMsg.value.content.contact) )
                                })
                            )
                        ),
                        q.Lambda('followMsg', q.Get(q.Var('followMsg')))
                    )
                ) :
                Promise.resolve(null)
            )

            return Promise.all([postProm, foafProm])
        })
        .then(([postRes, foafRes]) => {
            return [
                ((postRes || {}).data || []).map(d => d.data),
                ((foafRes || {}).data || []).map(d => d.data)
            ]
        })
        .then(([postArr, foafArr]) => {
            // get posts in here
            if (!foafArr.length) {
                return postArr
            }

            return client.query(
                q.Map(
                    q.Paginate(
                        q.Union(
                            // get the posts from people in the foaf array
                            foafArr.map(followMsg => {
                                return q.Reverse(q.Match(q.Index('post_by_author'),
                                    followMsg.value.content.contact))
                            })
                        )
                    ),
                    q.Lambda('post', q.Get(q.Var('post')))
                )
            )
                // concat the posts from 1 hop out with the foaf posts
                .then(res => (postArr || []).concat(res.data.map(d => {
                    return xtend(d.data, {
                        value: xtend(d.data.value, {
                            previous: d.data.value.previous || null
                        })
                    })
                })))
        })
}