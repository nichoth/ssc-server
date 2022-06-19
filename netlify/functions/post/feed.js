require('dotenv').config()
var faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})


module.exports = {
    getLatest: function (did) {
        return client.query(
            q.Get(q.Match(q.Index('author'), did))
        )
            .then(doc => {
                return {
                    statusCode: 200,
                    body: JSON.stringify(doc.data)
                }
            })
    }
}
