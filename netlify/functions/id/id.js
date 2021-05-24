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
    client.query(
        q.Login(
            q.Match(Index("login-name"), name), {
                password: password
            }
        )
    )
        .then(res => {
            // password is ok, return the secrets
            console.log('res', res)
            return cb(null, {
                statusCode: 200,
                body: JSON.stringify(res)
            })
        })
        .catch(err => {
            // login failed, return an err
            console.log('errrrr', err)
            return cb(null, {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'oh no',
                    err: err
                })
            })
        })
}
