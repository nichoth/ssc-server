// var ssc = require('@nichoth/ssc')
require('dotenv').config()
var follow = require('@nichoth/ssc-fauna/follow')
let cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = function (ev, ctx, cb) {
    // var req = JSON.parse(ev.body)
    if (ev.httpMethod !== 'GET' && ev.httpMethod !== 'POST') {
        return cb(null, {
            statusCode: 400,
            body: JSON.stringify({
                ok: false,
                message: 'should be a get or post request'
            })
        })
    }

    if (ev.httpMethod === 'POST') {
        var { author, keys, msg } = JSON.parse(ev.body)

        follow.post(author, keys, msg)
            .then(res => {
                return cb(null, {
                    statusCode: 200,
                    body: JSON.stringify(res)
                })
            })
            .catch(err => {
                console.log('****fflobbb', err)
                return cb(null, {
                    statusCode: 500,
                    body: err.toString()
                })
            })
    }
    
    if (ev.httpMethod === 'GET') {
        var author = ev.queryStringParameters.author

        console.log( '**get following author**', author )

        // who are you following?
        return follow.get(author)
            .then(res => {
                // console.log('**following response**', res)
                return cb(null, {
                    statusCode: 200,
                    body: JSON.stringify(res)
                })
            })
            .catch(err => {
                console.log('aaaaaaa', err)
                return cb(null, {
                    statusCode: 500,
                    body: JSON.stringify({
                        ok: false,
                        message: err.toString()
                    })
                })
            })
    }
}
