var ssc = require('@nichoth/ssc')

// return the most recent 'about' msg
exports.handler = function (ev, ctx, cb) {
    if (ev.httpMethod === 'GET') {
        var author = ev.queryStringParameters.author

        cb(null, {
            statusCode: 422,
            body: JSON.stringify({
                ok: false,
                error: 'invalid json',
                message: err.message
            })
        })
    }

    cb(null, {
        statusCode: 400,
        body: 'booo'
    })

}

