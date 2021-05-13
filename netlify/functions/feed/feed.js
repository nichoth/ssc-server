// var ssc = require('@nichoth/ssc')
require('dotenv').config()
var faunadb = require('faunadb')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

exports.handler = function (ev, ctx, cb) {
    var req = JSON.parse(ev.body)
    var { author } = req

    console.log('**author**', author)


    // if (ev.httpMethod !== 'GET') {
    //     return cb(null, {
    //         statusCode: 400,
    //         body: 'You have to send a GET request'
    //     })
    // }


    client.query(
        q.Map(
            q.Paginate(
                q.Match(q.Index('author'), author)
            ),
            q.Lambda( 'post', q.Get(q.Var('post')) )
        )
    )
        .then(function (res) {
            // console.log('**hhhhh**', res)
            return cb(null, {
                statusCode: 200,
                body: JSON.stringify({
                    ok: true,
                    msgs: res.data.map(post => post.data)
                })
            })
        })
        .catch(err => {
            console.log('errrrrrrr', err)
            return cb(null, {
                statusCode: 500,
                body: JSON.stringify({
                    ok: false,
                    error: new Error('query')
                })
            })
        })

}
