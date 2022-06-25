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
            
            q.Lambda( "profile", Get(Var("profile")) )
        )
    )
      
      
        
      
      





    // return client.query(q.Map(
    //     q.Paginate(

    //         // new stuff
    //         q.Join(
    //             // who are we following?
    //             // should be an array of refs to follow msgs
    //             q.Match(q.Index('following_contact'), did),

    //             // need to match on an index 'profile_by_followRef'

    //             // select the 'data.value.content.contact' value

    //             q.Index("profile_by_did")

    //             // then get 'about' messages by did

    //             // TODO
    //             // `profile_by_followRef` doesn't work b/c
    //             // the profiles are created before follows
    //             // needs to be `follow_by_profileRef`
    //             // q.Index('profile_by_followRef')
    //         )


    //         // old stuff
    //         // these are 'follow' messages, need 'profile' msgs
    //         // q.Match(q.Index('following'), did)
    //     ),

    //     q.Lambda(
    //         "msg",
    //         q.Get(q.Var("msg"))
    //     )

    // ))
    //     .then(res => {
    //         console.log('foloooooooooooowing', JSON.stringify(res.data))
    //         return {
    //             statusCode: 200,
    //             body: JSON.stringify(res.data.map(msg => msg.data))
    //         }
    //     })
}
