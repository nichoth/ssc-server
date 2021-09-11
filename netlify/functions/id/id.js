var faunadb = require('faunadb')

// take a name and password, return the keys
// do 'login'
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
        q.Login(q.Match(q.Index("login-name"), name), {
            password: password
        })
    )
        .then(res => {
            // password is ok, return the secrets
            client.query(
                q.Get(
                    q.Match(q.Index('login-name'), name)
                )
            )
                .then(res => {
                    return cb(null, {
                        statusCode: 200,
                        body: JSON.stringify(res.data)
                    })
                })
                .catch(err => {
                    console.log('err up here', err)
                    return cb(null, {
                        statusCode: 500,
                        body: JSON.stringify({
                            message: 'The lookup of secrets failed',
                            err: err
                        })
                    })
                })
        })
        .catch(err => {
            // login failed, return an err
            console.log('errrrr in id', err)
            return cb(null, {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'oh no',
                    err: err
                })
            })
        })
}
