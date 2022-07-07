require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
const { blobHash } = require('../../../src/util')
const upload = require('../upload')
const q = faunadb.query
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const resolveAlt = require('../resolve-alt')
const { admins } = require('../../../src/config.json')
const { PUBLIC_KEY } = process.env

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod === 'GET') {
        const { did, username } = ev.queryStringParameters

        if (!did && !username) {
            return {
                statusCode: 422,
                body: 'missing a query param'
            }
        }

        var prom
        if (did) {
            prom = client.query(
                q.Get(q.Match(q.Index('profile_by_did'), did))
            )
        } else if (username) {
            prom = client.query(
                q.Map(
                    q.Paginate(
                        q.Match(q.Index('profile_by_name'), username)
                    ),
                    q.Lambda("msg", q.Get(q.Var("msg")))
                )
            )
        }

        return prom
            .then(doc => {
                return {
                    statusCode: 200,
                    body: JSON.stringify(
                        did ?
                            doc.data :
                            // query by name returns a list
                            doc.data.map(_doc => _doc.data)
                    )
                }
            })
            .catch(err => {
                console.log('errrrr', err)
                console.log('*did*', did)

                if (err.toString().includes('not found')) {
                    return {
                        statusCode: 400,
                        body: 'invalid DID ' + did
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

        msg.previous = (msg.previous || null)

        if (msg.content.type !== 'about') {
            return {
                statusCode: 422,
                body: 'invalid message type'
            }
        }

        const did = ssc.getAuthor(msg)
        const pubKey = ssc.didToPublicKey(did).publicKey

        console.log('pub key', pubKey)
        console.log('message', msg)

        // here, check the msg sig
        try {
            var isVal = await ssc.isValidMsg(msg, null, pubKey)
        } catch (err) {
            console.log('errrr', err)
            return {
                statusCode: 422,
                body: 'err -- invalid signature'
            }
        }

        if (!isVal) {
            console.log('not valid')
            return {
                statusCode: 422,
                body: 'invalid signature'
            }
        }


        // need to check if the request is from an either an `admin`
        // or someone in an `alternate` chain
        // or a DID that is followed by this server
        // if it is, then we can write the message to the DB

        // if there is a message `to` this DID, then it is part of an alt chain
        // if there is no `to` message, then this _must_ be an `admin` DID,
        // or a DID that is `follow`ed by the server

        const isAdmin = admins.some(el => el.did === did)

        if (isAdmin) {
            return await update({ did, pubKey, msg, file })
        }

        // @TODO -- handle alt accounts
        var isAlt = false
        var resolvedAlt 

        try {
            resolvedAlt = await resolveAlt(did)
            // not equal b/c `resolveAlt` will return the 'root' profile
            // that the given profile resolves to
            // so if this is a 'root' did, then it will be returned
            //   by `resolveAlt`
            isAlt = resolvedAlt.value.content.about !== did
        } catch (err) {
            if (err.toString().includes('BadRequest: call error')) {
                // this means it is a DID that does not exist
                isAlt = false
            } else {
                console.log('ooooohhhhh no', err)
                throw err
            }
        }

        if (isAlt) {
            console.log('updating...')
            return await update({ did, pubKey, msg, file })
        }

        // query goes here to check if server is following DID
        // const isFollowed = false
        // const isNotFollowed = await client.query(
        const isFollowed = !(await client.query(
            q.IsEmpty(q.Match(
                q.Index('a_follows_b'),
                [ssc.publicKeyToDid(PUBLIC_KEY), did]
            ))
        ))

        if (isFollowed) {
            return await update({ did, pubKey, msg, file })
        }

        return {
            statusCode: 401,
            body: 'not allowed'
        }
    }

    return {
        statusCode: 405,
        body: 'method is not ok'
    }
}


async function update ({ did, msg, pubKey, file }) {
    const isVal = await ssc.isValidMsg(msg, null, pubKey)

    if (!isVal) {
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
        const _hash = blobHash(file)

        if (_hash !== msg.content.image) {
            return {
                statusCode: 400,
                body: "Hash doesn't match"
            }
        }

        return upload(file, _hash)
            .then(res => {
                // then write the profile message to the DB
                const key = ssc.getId(msg)
                return writeMsg(did, key, msg).then(_res => {
                    return {
                        statusCode: 200,
                        body: JSON.stringify({
                            image: res.response,
                            // this is b/c the DB I think strips out `null`
                            // values from the message objects
                            db: Object.assign(_res.data, {
                                value: Object.assign(_res.data.value, {
                                    previous: _res.data.value.previous || null,
                                    content: Object.assign(_res.data.value.content, {
                                        desc: _res.data.value.content.desc || null
                                    })
                                })
                            })
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
        // @TODO
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

function writeMsg (did, key, msg) {
    return client.query(
        q.If(
            q.IsEmpty(
                q.Match(q.Index('profile_by_did'), did)
            ),
            q.Create(
                q.Collection('profiles'),
                { data: { key: key, value: msg } },
            ),
            q.Replace(
                q.Select('ref', q.Get(
                    q.Match(q.Index('profile_by_did'), did)
                )),
                { data: { key: key, value: msg } }
            )
        )
    )
}
