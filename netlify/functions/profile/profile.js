const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
const xtend = require('xtend')
var createHash = require('create-hash')
const upload = require('./upload')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})


exports.handler = async function (ev, ctx) {
    if (ev.httpMethod === 'GET') {
        const did = ev.queryStringParameters.did

        console.log('*get profile req*', did)

        return client.query(
            q.Get(q.Match(q.Index('profile-by-did'), did))
        )
            .then(doc => {
                return {
                    statusCode: 200,
                    body: JSON.stringify(doc.data)
                }
            })
            .catch(err => {
                console.log('errrrr', err)
                console.log('*did*', did)

                if (err.toString().includes('not found')) {
                    return {
                        statusCode: 400,
                        body: 'invalid DID'
                    }
                }

                return {
                    statusCode: 500,
                    body: err.toString()
                }
            })
    }

    if (ev.httpMethod === 'POST') {
        var msg, file
        try {
            const body = JSON.parse(ev.body)
            msg = body.msg
            file = body.file
        } catch (err) {
            return {
                statusCode: 422,
                body: 'invalid json'
            }
        }

        console.log('**got a profile post req**', msg)

        const did = ssc.getAuthor(msg)
        const pubKey = ssc.didToPublicKey(did).publicKey




        // need to check if the request is from an either an `admin`
        // or someone in an `alternate` chain
        // if it is, then we can write the message to the DB

        // if there is a message `to` this DID, then it is part of an alt chain
        // if there is no `to` message, then this _must_ be an `admin` DID,
        // or a DID that is `follow`ed by the server




        const isVal = await ssc.isValidMsg(msg, null, pubKey)
        if (!isVal) {
            console.log('**invalid msg**', pubKey)
            return {
                statusCode: 422,
                body: 'invalid signature'
            }
        }

        if (!msg.content.username) {
            return {
                statusCode: 422,
                body: 'missing username'
            }
        }

        // if not updating the avatar, then you upload a message with
        // the same file hash in the `msg.image` field, but no `file` key in
        // the request

        if (file) {
            var hash = createHash('sha256')
            hash.update(file)
            const _hash = hash.digest('base64')

            if (_hash !== msg.content.image) {
                return {
                    statusCode: 400,
                    body: "Hash doesn't match"
                }
            }

            return upload(file, _hash)
                .then(res => {
                    // then write the profile message to the DB

                    // writeMsg (did, key, msg) {
                    const key = ssc.getId(msg)
                    return writeMsg(did, key, msg).then(_res => {
                        return {
                            statusCode: 200,
                            body: JSON.stringify({
                                image: res,
                                db: _res.data
                            })
                        }
                    })
                })
                .catch(err => {
                    return {
                        statusCode: 500,
                        body: err.toString()
                    }
                })
        } else {
            // if !file, then the image hash should be equal to existing hash
            const key = ssc.getId(msg)
            return writeMsg(did, key, msg).then(res => {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        db: res.data
                    })
                }
            })
        }
    }

    return {
        statusCode: 400,
        body: 'booo'
    }
}

function writeMsg (did, key, msg) {
    return client.query(
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
}
