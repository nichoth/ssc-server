require('dotenv').config()
var faunadb = require('faunadb')
let cloudinary = require("cloudinary").v2;
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
var xtend = require('xtend')

exports.handler = async function (ev, ctx) {
    var q = faunadb.query
    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })
    var key = ev.queryStringParameters.key

    try {
        var post = await client.query(
            q.Get(
                q.Match(q.Index('key'), key)
            )
        );

        var mentionUrls = post.data.value.content.mentions.map(mention => {
            // slugify the hash twice
            // don't know why we need to do it twice
            var slugifiedHash = encodeURIComponent('' + mention)
            var slugslug = encodeURIComponent(slugifiedHash)
            return cloudinary.url(slugslug)
        })

        return {
            statusCode: 200,
            body: JSON.stringify({
                ok: true,
                post: xtend(post.data, {
                    mentionUrls: mentionUrls
                })
            })
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: err.toString()
        }
    }
}
