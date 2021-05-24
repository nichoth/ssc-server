var faunadb = require('faunadb')

exports.handler = function (ev, ctx, cb) {
    try {
        var { name, password } = JSON.parse(ev.body)
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



    var q = faunadb.query
    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })



    // do the db login by `name`
}
