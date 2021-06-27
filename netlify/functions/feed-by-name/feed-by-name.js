// var ssc = require('@nichoth/ssc')
require('dotenv').config()
var faunadb = require('faunadb')
// var xtend = require('xtend')

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

// this gets a feed by the username, not by the public key
exports.handler = function (ev, ctx, cb) {
    if (ev.httpMethod !== 'GET') {
        return cb(null, {
            statusCode: 400,
            body: 'You have to send a GET request'
        })
    }

    var username = ev.queryStringParameters.username

    // get the user ID for the username
    // then get the feed for that user ID


}

