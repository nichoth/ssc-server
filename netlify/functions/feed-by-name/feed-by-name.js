require('dotenv').config()
var { getByName } = require('@nichoth/ssc-fauna/feed')
let cloudinary = require("cloudinary").v2;
var xtend = require('xtend')

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// this gets a feed by the username, not by the public key
exports.handler = function (ev, ctx, cb) {
    if (ev.httpMethod !== 'GET') {
        return cb(null, {
            statusCode: 400,
            body: 'You have to send a GET request'
        })
    }

    var username = ev.queryStringParameters.username

    console.log('**username**', username)

    getByName(username)
        .then(res => {
            console.log('**res**', res)
            return cb(null, {
                statusCode: 200,
                body: JSON.stringify(res.map(post => {
                    var mentionUrls = ((post.value.content.mentions) || [])
                        .map(mention => {
                            // slugify the hash twice
                            // don't know why we need to do it twice
                            // var slugifiedHash = encodeURIComponent('' + mention)
                            // var slugslug = encodeURIComponent(slugifiedHash)
                            return cloudinary.url(mention)      
                        })

                    var xtendedMsg = xtend(post, {
                        mentionUrls: mentionUrls
                    })

                    if (!xtendedMsg.value.previous) {
                        xtendedMsg.value.previous = null
                    }

                    return xtendedMsg
                }))
            })
        })
        .catch(err => {
            return cb(null, {
                statusCode: 500,
                body: err.toString()
            })
        })
}

