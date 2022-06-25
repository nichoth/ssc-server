
const faunadb = require('faunadb')
// const xtend = require('xtend')
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
                // body: JSON.stringify(res)
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





// function getFollowing (id) {
//     return client.query(
//         // get everyone `id` is following
//         q.Map(
//             q.Paginate(
//                 q.Reverse( q.Match(q.Index('following'), id) )
//             ),
//             q.Lambda( 'followMsg', q.Get(q.Var('followMsg')) )
//         )
//     )
// }


// union takes a list
// does it dedup?

function getWithFoafs (did) {

    // Joins takes a list of something and an index

    // need a way to dedup the social graph
    // meaning
    // a two person circle ('friends')
    // you get person B, and their friends includes you
    // so your posts are returned b/c you're within 2 hops

    // from fauna shell
    const postProm = client.query(
        q.Map(
            q.Paginate(
                q.Reverse(
                    q.Union(
                        // this gets posts from everyone *you are following*,
                        q.Join(
                            q.Match("following_contact", did),
                            q.Index("post_by_author")
                        ),
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
            
            q.Lambda("x", q.Get(q.Var("x")))
        )
    )

    return postProm






    // // return getFriendsAndFoafs(id)
    // return getFollowing(did)

    //     // first we get everyone that `id` is following
    //     .then(res => {
    //         return res.data.map(d => d.data)
    //     })
    //     .then(arr => {
    //         // arr is everyone I'm following
    //         // if (!arr.length) return Promise.resolve([ {}, {} ])

    //         console.log('arrrrrrrrrrrr', JSON.stringify(arr, null, 2))

    //         // "value": {
    //             // "sequence": 1,
    //             // "author": "did:key:z82T5ZZpeVK7rYyRHsrjhQcxnGnL5hjux5aUQ251wDSuF1Mn3qMmUkvueqsKP3zbgHRvuHvSdR5wqmyRcZpbE9DLxnXH2",
    //             // "timestamp": 1656122845847,
    //             // "hash": "sha256",
    //             // "content": {
    //                 // "type": "follow",
    //                 // "contact": "did:key:z82T5VbUheY9iVJv26ZEXnH5Rn8vsgTZQmyfojJjqKVUG1AQxFi53JtooN1hAwfLcdnqjg7EQxpMQzdvwGUPmwsLPuhYd"
    //             // },
    //             // "signature": "flH22jGWkveKFrTsjA3yMJX6UVqm7hiE7+JCfxK7CDtI/FqpcQxiJdOKWx8BuyDzvDmZtzyc99+xnGY+4QD1Ow=="
    //         // }






            
            




    //         // for each contact in the follow messages above,
    //         // need to get *their contacts* (who they are following)

    //         // var postProm = client.query(
    //         //     q.Map(
    //         //         q.Paginate(
    //         //             q.Union(
    //         //                 // get the posts for the follow array
    //         //                 // include your own id
    //         //                 [q.Reverse(
    //         //                     q.Match(q.Index('post_by_author'), id)
    //         //                 )].concat(arr.map(followMsg => {
    //         //                     return q.Reverse(
    //         //                         q.Match(
    //         //                             q.Index('post_by_author'),
    //         //                             followMsg.value.content.contact
    //         //                         )
    //         //                     )
    //         //                 }))
    //         //             )
    //         //         ),
    //         //         q.Lambda('post', q.Get(q.Var('post')))
    //         //     )
    //         // )


    //         // get your foafs
    //         // client.query(q.Map(
    //         //     q.Paginate(
    //         //         q.Join(
    //         //             // need to take everyone in this response,
    //         //             // and get *their* contacts
    //         //             q.Match( q.Index("following_contact"), did ),
    //         //             q.Index("post_by_author")
    //         //         )

    //         //         // q.Union(
    //         //         //     // an array of fauna operators
    //         //         // )
    //         //     )
    //         // ))



    //         // here we have an array of people you're following
    //         // the follwed id is
    //         // [{ value: { content: { contact } }}]
    //         // we are getting everyone they're following
    //         // var foafProm = (arr.length ?
    //         //     client.query(
    //         //         q.Map(
    //         //             q.Paginate(
    //         //                 q.Union(
    //         //                     arr.map(folMsg => {
    //         //                         console.log('folll msggggg', folMsg)
    //         //                         return q.Reverse(
    //         //                             q.Match(
    //         //                                 q.Index('post_by_author'),
    //         //                                 folMsg.value.content.contact
    //         //                             )
    //         //                         )
    //         //                         // return q.Reverse( q.Match(q.Index('following'),
    //         //                         //     folMsg.value.content.contact) )
    //         //                     })
    //         //                 )
    //         //             ),
    //         //             q.Lambda('followMsg', q.Get(q.Var('followMsg')))
    //         //         )
    //         //     ) :
    //         //     Promise.resolve(null)
    //         // )

    //         // const foafProm = Promise.resolve([])

    //         // return Promise.all([postProm, foafProm])
    //     })
    //     .then(postRes => {
    //         console.log('got posts', postRes)
    //         return ((postRes || {}).data || []).map(doc => doc.data)
    //     })
    //     // .then(([postRes, foafRes]) => {
    //     //     return [
    //     //         ((postRes || {}).data || []).map(d => d.data),
    //     //         ((foafRes || {}).data || []).map(d => d.data)
    //     //     ]
    //     // })
    //     // .then(([postArr, foafArr]) => {
    //     //     // get posts in here
    //     //     console.log('foaffffffffff', JSON.stringify(foafArr, null, 2))
    //     //     if (!foafArr.length) {
    //     //         return postArr
    //     //     }

    //     //     // return (postArr || []).concat(foafArr)
    //     //     return postArr

    //     //     // return client.query(
    //     //     //     q.Map(
    //     //     //         q.Paginate(
    //     //     //             q.Union(
    //     //     //                 // get the posts from people in the foaf array
    //     //     //                 foafArr.map(followMsg => {
    //     //     //                     return q.Reverse(q.Match(q.Index('post_by_author'),
    //     //     //                         followMsg.value.content.contact))
    //     //     //                 })
    //     //     //             )
    //     //     //         ),
    //     //     //         q.Lambda('post', q.Get(q.Var('post')))
    //     //     //     )
    //     //     // )
    //     //     //     // concat the posts from 1 hop out with the foaf posts
    //     //     //     .then(res => (postArr || []).concat(res.data.map(d => {
    //     //     //         return xtend(d.data, {
    //     //     //             value: xtend(d.data.value, {
    //     //     //                 previous: d.data.value.previous || null
    //     //     //             })
    //     //     //         })
    //     //     //     })))
    //     // })
}