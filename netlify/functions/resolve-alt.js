require('dotenv').config()
const faunadb = require('faunadb')
const q = faunadb.query

const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

if (require.main === module) {
    // is running from CLI
    resolveAlt("did:key:z82T5ZZpeVK7rYyRHsrjhQcxnGnL5hjux5aUQ251wDSuF1Mn3qMmUkvueqsKP3zbgHRvuHvSdR5wqmyRcZpbE9DLxnXH2")
        .then(res => {
            console.log('*resolved*', JSON.stringify(res, null, 2))
        })
        .catch(err => {
            if (err.requestResult.responseRaw.includes('instance not found')) {
                console.log('***that DID does not exist!!!***')
            }
            console.log('errrrrrrrrr', err)
        })
}

function resolveAlt (did) {
    return client.query(q.Call('resolve-alt', [did]))

    // Query(
    //     Lambda(
    //         ["to"],
    //         Let(
    //             {
    //                 altDoc: Match(Index("alternate-to"),
    //                 Var("to"))
    //             },
    //             If(
    //                 IsEmpty(Var("altDoc")),
    //                 Get( Match(Index("profile-by-did"), Var("to")) ),
    //             Call(
    //                 "resolve-alt",
    //                 Select(
    //                     ["data", "value", "content", "from"],
    //                     Get(Var("altDoc"))
    //                 )
    //             )
    //             )
    //         )
    //     )
    // )

}

module.exports = resolveAlt
