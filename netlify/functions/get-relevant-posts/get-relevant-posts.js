require('dotenv').config()
var getRelevantPosts = require('@nichoth/ssc-fauna/relevant-posts').get

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

    console.log('user id', userId)

    getRelevantPosts(userId)
        .then(res => {
            console.log('**got relevant posts****', res)

            cb(null, {
                statusCode: 200,
                body: JSON.stringify({
                    ok: true,
                    msg: res
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
