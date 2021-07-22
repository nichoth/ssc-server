require('dotenv').config()
var file = require('./following.json')

exports.handler = function (ev, ctx, cb) {
    console.log('file', file)

    var req = JSON.parse(ev.body)
    console.log('got req', req)

    return cb(null, {
        statusCode: 200,
        body: JSON.stringify({ ok: true })
    })
}
