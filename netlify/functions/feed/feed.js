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
        // pasted from fauna shell
        // this get posts by the *first* author with given name

        console.log('doing username', username)

        // would want to look at the path/params to check for an index number
        // if there is an index,
        //   then you should get that profile at the query start

        return client.query(
            q.Map(
                [q.Get( 
                    q.Match(q.Index("profile_by_name"), username),
                )],
                q.Lambda(
                    "profile",
                    q.Map(
                        q.Paginate(
                            q.Reverse(
                                q.Match(
                                    q.Index("post_by_author"),
                                    q.Select(
                                        ['data','value','author'],
                                        q.Var("profile")
                                    )
                                )
                            ),
                        ),

                        q.Lambda("post", q.Get(q.Var("post")))
                    )
                )
            )
        )
            .then(res => {
                return {
                    statusCode: 200,
                    body: JSON.stringify(res[0].data.map(doc => {
                        // this is b/c the DB strips out `null` values
                        // from the message objects
                        return Object.assign(doc.data, {
                            value: Object.assign(doc.data.value, {
                                previous: doc.data.value.previous || null
                            })
                        })
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
            
            
            // need to get the profile by username
            // then search for posts by the DID in that profile
            
            // return client.query(
            //     q.Map(
            //         q.Paginate(
            //             q.Join(
            //                 // TODO -- how to get just the first match
            //                 //   for this username?
            //                 q.Match(q.Index('profile_did_by_name'), username),
            //                 q.Index("post_by_author")
            //                 // q.Lambda("did", )
            //             ),
            //         ),

            //         q.Lambda("post", q.Get(q.Var("post")))
            //     )
            // )


            // return client.query(
            //     q.Map(
            //         q.Paginate(
            //             q.Reverse( q.Match(q.Index('post_by_author'), did) )
            //         ),
            //         q.Lambda( 'post', q.Get(q.Var('post')) )
            //     )
            // )
                // .then(res => {
                //     return {
                //         statusCode: 200,
                //         body: JSON.stringify(res.data.map(doc => {
                //             return doc.data
                //         }))
                //         // body: JSON.stringify(res.data)
                //         // body: JSON.stringify(res.data.map(doc => {
                //         //     // this is b/c the DB strips out `null` values
                //         //     // from the message objects
                //         //     return Object.assign(doc.data, {
                //         //         value: Object.assign(doc.data.value, {
                //         //             previous: doc.data.value.previous || null
                //         //         })
                //         //     })
                //         // }))
                //     }
                // })
    }

    // no username or did
    return Promise.resolve({
        statusCode: 422,
        body: 'missing query param'
    })
}
