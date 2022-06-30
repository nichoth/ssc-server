const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
var q = faunadb.query
const { PUBLIC_KEY } = process.env

module.exports = function (did) {
    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })

    return client.query(
        q.IsEmpty(q.Match(
            q.Index('a_follows_b'),
            [ ssc.publicKeyToDid(PUBLIC_KEY), did ]
        ))
    )
        .then(isEmpty => {
            console.log('servers DID', ssc.publicKeyToDid(PUBLIC_KEY))
            console.log('new user DID', did)
            return isEmpty ? false : true
        })
}
