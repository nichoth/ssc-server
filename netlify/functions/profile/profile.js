const faunadb = require('faunadb')
const xtend = require('xtend')
const sha256 = require('simple-sha256')
const getMentions = require('./get-mentions')
const upload = require('./upload')
const parallel = require('run-parallel')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

exports.handler = function (ev, ctx, cb) {
    if (ev.httpMethod === 'GET') {
        const did = ev.queryStringParameters.did

        return client.query(
            q.Get(q.Match(q.Index('profile-by-did'), did))
        )
            .then(doc => {
                const res = xtend(doc.data, {
                    value: xtend(doc.data.value, {
                        content: xtend(doc.data.value.content, {
                            avatar: doc.data.value.content.avatar || null
                        })
                    })
                })

                cb(null, {
                    statusCode: 200,
                    body: JSON.stringify(res)
                })
            })
            .catch(err => {
                console.log('errrrr', err)
                if (err.toString().includes('invalid ref')) {
                    cb(null, {
                        statusCode: 400,
                        body: 'invalid DID'
                    })
                }

                cb(null, {
                    statusCode: 500,
                    body: err.toString()
                })
            })
    }

    // request *must* have a `msg` key, even if it is the same as it
    //     was previously
    // may also have a file, only if you are changing the avatar
    if (ev.httpMethod === 'POST') {
        var msg, file
        try {
            const body = JSON.parse(ev.body)
            msg = body.msg
            file = body.file
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

        return parallel([
            _cb => {
                // upload the file to cloudinary
                if (file) {
                    sha256(file).then(hash => {
                        if (hash !== getMentions.first(msg)) {
                            return _cb ("Hash doesn't match")
                        }

                        upload(file, hash)
                            .then(res => _cb(null, res))
                            .catch(err => _cb(err))
                    }).catch(err => {
                        return _cb(null, {
                            statusCode: 500,
                            body: JSON.stringify({
                                ok: false,
                                error: 'hashing error',
                                message: err.message
                            })
                        })
                    })
                } else {
                    process.nextTick(() => _cb(null))
                }
            },

            // write the message to the DB
            _cb => {
                const key = ssc.getId(msg)
                const did = ssc.getAuthor(msg)

                client.query(
                    q.If(
                        q.IsEmpty(
                            q.Match(q.Index('profile-by-did'), did)
                        ),
                        q.Create(
                            q.Collection('profiles'),
                            { data: { key: key, value: msg } },
                        ),
                        q.Replace(
                            q.Select('ref', q.Get(
                                q.Match(q.Index('profile-by-did'), did)
                            )),
                            { data: { key: key, value: msg } }
                        )
                    )
                )
                    .then(res => _cb(null, res))
                    .catch(err => _cb(err))
            }
        ], function allDone (err, res) {
            if (err) {
                return cb(null, {
                    statusCode: 500,
                    body: err.toString()
                })
            }

            cb(null, {
                statusCode: 200,
                body: JSON.stringify(res)
            })
        })
    }


    cb(null, {
        statusCode: 400,
        body: 'booo'
    })
}
