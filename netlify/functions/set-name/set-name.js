var faunadb = require('faunadb')
var ssc = require('@nichoth/ssc')

// return the most recent 'about' msg
exports.handler = async function (ev, ctx) {
    var q = faunadb.query
    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })


    try {
        var { keys, msg } = JSON.parse(ev.body)
    } catch (err) {
        return cb(null, {
            statusCode: 422,
            body: JSON.stringify({
                ok: false,
                error: 'invalid json',
                message: err.message
            })
        })
    }


}
