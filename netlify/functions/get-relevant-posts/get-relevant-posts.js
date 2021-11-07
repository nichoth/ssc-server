require('dotenv').config()
var relevant = require('@nichoth/ssc-fauna/relevant-posts')
var getRelevantPosts = relevant.get
var getWithFoafs = relevant.getWithFoafs
var xtend = require('xtend')

let cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = function (ev, ctx, cb) {
    if (ev.httpMethod !== 'GET') {
        return cb(null, {
            statusCode: 400,
            body: JSON.stringify({
                ok: false,
                message: 'should be a get request'
            })
        })
    }

    // http method is get
    var userId = ev.queryStringParameters.userId
    var foafs = ev.queryStringParameters.foafs

    if (foafs) {
        console.log('!!!foafs!!!', foafs)
        return getWithFoafs(userId)
            .then(res => {
                // console.log('******res****', res)
                return cb(null, {
                    statusCode: 200,
                    body: JSON.stringify({
                        ok: true,
                        // here we need to map them so they have a URL for the
                        // image
                        msg: res.map(msg => {
                            return xtend(msg, {
                                mentionUrls: msg.value.content.mentions ?
                                    msg.value.content.mentions.map(m => {
                                        return cloudinary.url(m)      
                                    }) :
                                    []
                            })
                        })
                    })
                })
            })
            .catch(err => {
                console.log('oh no rrrrrrrr', err)
                return cb(null, {
                    statusCode: 500,
                    body: err.toString()
                })
            })
    }

    console.log('user id', userId)

    getRelevantPosts(userId)
        .then(res => {

            cb(null, {
                statusCode: 200,
                body: JSON.stringify({
                    ok: true,
                    // here we need to map them so they have a URL for the
                    // image
                    msg: res.map(msg => {
                        return xtend(msg, {
                            mentionUrls: msg.value.content.mentions ?
                                msg.value.content.mentions.map(m => {
                                    // slugify the hash twice
                                    // don't know why we need to do it twice
                                    // var slugifiedHash = encodeURIComponent('' + m)
                                    // var slugslug = encodeURIComponent(
                                    //     slugifiedHash)
                                    return cloudinary.url(m)      
                                }) :
                                []
                        })
                    })
                })
            })
        })
        .catch(err => {
            return cb(null, {
                statusCode: 500,
                body: JSON.stringify({
                    ok: false,
                    message: err.toString()
                })
            })
        })
}
