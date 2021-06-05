var faunadb = require('faunadb')
var createHash = require('crypto').createHash


exports.handler = function (ev, ctx, cb) {

    try {
        var { keys, file } = JSON.parse(ev.body)
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

    var hash = createHash('sha256')
    hash.update(file)
    var _hash = hash.digest('base64')
    console.log('******hash', hash, _hash)
    // var slugifiedHash = encodeURIComponent('' + _hash)

    client.query(
        q.If(
            q.Exists(q.Match(q.Index('avatar-by-id'), '@' + keys.public)), 
            q.Replace(
                q.Match(q.Index('avatar-by-id'), '@' + keys.public),
                { data: { about: keys.public, avatarLink: _hash } },
            ),
            q.Create(
                q.Collection('avatar'),
                { data: { about: keys.public, avatarLink: _hash } },
            )
        )
    )

}
