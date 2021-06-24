var faunadb = require('faunadb')
// var createHash = require('crypto').createHash
var upload = require('../upload')
var getHash = require('../get-file-hash')
let cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// we're not doing an ssb style post in this case
exports.handler = function (ev, ctx, cb) {

    var q = faunadb.query
    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })

    // -------------- GET ----------------------------------------------

    if (ev.httpMethod === 'GET') {
        // return the avatar
        var aboutWho = ev.queryStringParameters.aboutWho
        console.log('**about who**', aboutWho)

        client.query(
            q.Get( q.Match(q.Index('avatar-by-id'), aboutWho) )
        )
            .then(res => {
                // console.log('********avatar res***', res)

                // need to make a URL from hash + cloudinary
                var slugifiedHash = encodeURIComponent('' +
                    res.data.avatarLink)
                var slugslug = encodeURIComponent(slugifiedHash)
                var avatarUrl = cloudinary.url(slugslug)      

                // console.log('****** avatar url', avatarUrl)

                return cb(null, {
                    statusCode: 200,
                    body: JSON.stringify({
                        ok: true,
                        avatarUrl: avatarUrl
                    })
                })
            })
            .catch(err => {
                console.log('errrrr in avatar query', err)

                // they don't have an avatar yet
                if (err.toString().includes('instance not found')) {
                    return cb(null, {
                        statusCode: 200,
                        body: JSON.stringify({
                            ok: true,
                            avatarUrl: ''
                        })
                    })
                }

                return cb(null, {
                    statusCode: 500,
                    body: JSON.stringify({
                        ok: false,
                        err: err.toString()
                    })
                })
            })


        return
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
                            message: res.data
                        })
                    })
                })
                .catch(err => {
                    console.log('***errr fauna***', err)
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
                q.Exists(
                    q.Match(q.Index('avatar-by-id'), '@' + keys.public)
                ), 
                q.Replace(
                    q.Select('ref', q.Get(
                        q.Match(q.Index('avatar-by-id'), '@' + keys.public)
                    )),
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
