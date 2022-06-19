const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const { PUBLIC_KEY } = process.env

module.exports = function (did) {
    return client.query(
        q.IsEmpty(q.Match(
            q.Index('a_follows_b'),
            [ ssc.publicKeyToDid(PUBLIC_KEY), did ]
        ))
    )
            .then(isEmpty => (isEmpty ? false : true))
}
