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



    // const path = ev.path.replace(/\.netlify\/functions\/[^/]+/, '')
    // const segments = path.split('/').filter(Boolean)

    // console.log('path', path)
    // console.log('segments', segments)

    // e.g. GET /.netlify/functions/feed
    // if (segments.length === 0) {
    //     return readAllRoute.handler(event, context)
    // }

    // e.g. GET /.netlify/functions/feed/123456
    // if (segments.length !== 1) {
    //     return cb(null, {
    //         statusCode: 400,
    //         body: 'Missing feed id'
    //     })
    // }

    // console.log('****path', ev.path)

    // get the feed
    // var [author] = segments
    // console.log('author', author)



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