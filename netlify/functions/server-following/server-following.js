require('dotenv').config()
var faunadb = require('faunadb')
// var ssc = require('@nichoth/ssc')
var q = faunadb.query


// is this server following person X?


exports.handler = function (ev, ctx, cb) {
    // check that method is GET
    if (ev.httpMethod !== 'GET') {
        return cb(null, {
            statusCode: 400,
            body: (new Error('should be a get request')).toString()
        })
    }

    var who = ev.queryStringParameters.who

    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })

    client.query(
        q.Get(
            q.Match(q.Index('server-following-who'), who)
        )
    ).then(() => {
        return cb(null, {
            statusCode: 200,
            body: JSON.stringify({ isFollwing: true })
        })
    })
    .catch(err => {
        console.log('errrr', err)
        return cb(null, {
            statusCode: 500,
            body: new Error('nope').toString()
        })
    })
}
