// import { createRequire } from 'module';
// import path from 'path'
console.log('*import.meta.url*', import.meta.url)
// const data = context.clientContext.custom.netlify
// const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"))
// console.log('*decoded*', decoded)
// const require = createRequire(import.meta.url);
// const require = createRequire(decoded)

process.import = {
    meta: {
        url: '123'
    }
}

const faunadb = require('faunadb')
const xtend = require('xtend')
const sha256 = require('simple-sha256')
// const getMentions = require('./get-mentions')
const upload = require('./upload')
const parallel = require('run-parallel')
// import ssc from '@nichoth/ssc'
const ssc = require('@nichoth/ssc')

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

        const pubKey = ssc.didToPublicKey(ssc.getAuthor(msg))
        if (!ssc.isValidMsg(msg, null, pubKey)) {
            console.log('**invalid msg**', pubKey)
            return cb(null, {
                statusCode: 422,
                body: 'invalid signature'
            })
        }

        if (!msg.content.username) {
            return cb(null, {
                statusCode: 422,
                body: 'missing username'
            })
        }

        if (file) {
            sha256(file).then(hash => {
                if (hash !== msg.image) {
                    return cb(null, {
                        statusCode: 400,
                        body: "Hash doesn't match"
                    })
                }
            })
            .catch(err => {
                return cb(null, {
                    statusCode: 500,
                    body: err.toString()
                })
            })
        }

        return parallel([
            _cb => {
                // upload the file to cloudinary if it exists
                // if there is no image, do nothing
                if (file) {
                    upload(file, hash)
                        .then(res => _cb(null, res))
                        .catch(err => _cb(err))
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
