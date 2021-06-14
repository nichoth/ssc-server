// var ssc = require('@nichoth/ssc')
require('dotenv').config()
// var faunadb = require('faunadb')
var follow = require('@nichoth/ssc-fauna/follow')
// var xtend = require('xtend')

// var q = faunadb.query
// var client = new faunadb.Client({
//     secret: process.env.FAUNADB_SERVER_SECRET
// })

let cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = function (ev, ctx, cb) {
    // var req = JSON.parse(ev.body)
    if (ev.httpMethod !== 'GET') {
        return cb(null, {
            statusCode: 400,
            body: JSON.stringify({
                ok: false,
                message: 'should be a get request'
            })
        })
    }

    console.log('get req')
    var author = ev.queryStringParameters.author
    
    // who are you following?
    return follow.get(author)
        .then(res => {
            return cb(null, {
                statusCode: 200,
                body: JSON.stringify(res)
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
