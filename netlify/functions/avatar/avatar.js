var faunadb = require('faunadb')
// var createHash = require('crypto').createHash
var upload = require('../upload')
var getHash = require('../get-file-hash')

// we're not doing an ssb style post in this case
exports.handler = function (ev, ctx, cb) {

    if (ev.httpMethod === 'GET') {
        // return the avatar
    }

    // -----------------------------------------------------

    // method === 'POST'

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

    var hash = getHash(file)

    // var hash = createHash('sha256')
    // hash.update(file)
    // var _hash = hash.digest('base64')
    // console.log('******hash', hash, _hash)
    // var slugifiedHash = encodeURIComponent('' + _hash)

    upload(file, hash)
        .then(() => {
            writeToDB()
                .then(res => {
                    console.log('ok avatar', res)
                    return cb(null, {
                        statusCode: 200,
                        body: JSON.stringify({
                            ok: true,
                            message: res
                        })
                    })
                })
                .catch(err => {
                    console.log('errr fauna', err)
                    return cb(null, {
                        statusCode: 500,
                        body: JSON.stringify({
                            ok: false,
                            error: 'fauna query errrrr',
                            message: err.toString()
                        })
                    })
                })
        })
        .catch(err => {
            console.log('***errrrrr uploading***', err)
            return cb(null, {
                statusCode: 500,
                body: JSON.stringify({
                    ok: false,
                    error: 'uploading errrr',
                    message: err.message
                })
            })
        })

    function writeToDB () {
        return client.query(
            q.If(
                q.Exists(q.Match(q.Index('avatar-by-id'), '@' + keys.public)), 
                q.Replace(
                    q.Match(q.Index('avatar-by-id'), '@' + keys.public),
                    { data: { about: '@' + keys.public, avatarLink: hash } },
                ),
                q.Create(
                    q.Collection('avatar'),
                    { data: { about: '@' + keys.public, avatarLink: hash } },
                )
            )
        )
    }

}
