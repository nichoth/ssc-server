require('dotenv').config()
var { getByName } = require('@nichoth/ssc-fauna/feed')
let cloudinary = require("cloudinary").v2;

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

    console.log('***username', username)

    getByName(username)
        .then(res => {
            return cb(null, {
                statusCode: 200,
                body: JSON.stringify(res)
            })
        })
        .catch(err => {
            return cb(null, {
                statusCode: 500,
                body: err.toString()
            })
        })
}

