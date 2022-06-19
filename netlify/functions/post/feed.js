require('dotenv').config()
var faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

module.exports = {
    getLatest: function (did) {
        return client.query(
            q.Get(q.Match(q.Index('post_by_author'), did))
        )
            .then(res => {
                return res.data
            })
    }
}
