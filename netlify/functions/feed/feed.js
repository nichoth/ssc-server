// var ssc = require('@nichoth/ssc')
require('dotenv').config()
var faunadb = require('faunadb')
var xtend = require('xtend')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

let cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


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
                q.Reverse( q.Match(q.Index('author'), author) )
            ),
            q.Lambda( 'post', q.Get(q.Var('post')) )
        )
    )
        .then(function (res) {
            return cb(null, {
                statusCode: 200,
                body: JSON.stringify({
                    ok: true,
                    msgs: res.data.map(post => {
                        var mentionUrls = post.data.value.content
                            .mentions.map(mention => {

                                // slugify the hash twice
                                // don't know why we need to do it twice
                                var slugifiedHash = encodeURIComponent('' + mention)
                                var slugslug = encodeURIComponent(slugifiedHash)
                                return cloudinary.url(slugslug)      
                            })

                        var xtendedMsg = xtend(post.data, {
                            mentionUrls: mentionUrls
                        })

                        if (!xtendedMsg.value.previous) {
                            xtendedMsg.value.previous = null
                        }
                        console.log('******feed life', xtendedMsg)

                        return xtendedMsg
                    })
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
