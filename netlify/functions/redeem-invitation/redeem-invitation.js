require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
var createHash = require('create-hash')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const upload = require('../upload')

const { PUBLIC_KEY, SECRET_KEY } = process.env

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'invalid http method'
        }
    }

    var profile, redemption, file
    try {
        const body = JSON.parse(ev.body)
        profile = body.profile
        redemption = body.redemption
        file = body.file
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    console.log('***redemption***', redemption)
    console.log('***profile***', profile)
    // console.log('**file**', file)

    if (!redemption.author || redemption.content.type !== 'redeem-invitation' ||
    profile.author !== redemption.author) {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    const { code } = redemption.content
    const key = ssc.didToPublicKey(redemption.author)

    const hash = createHash('sha256')
    hash.update(file)
    const _hash = hash.digest('base64')

    if (_hash !== profile.content.image) {
        return {
            statusCode: 400,
            body: "Hash doesn't match"
        }
    }

    return Promise.all([
        ssc.isValidMsg(redemption, null, key.publicKey),
        ssc.isValidMsg(profile, null, key.publicKey),
        upload(file, _hash)
    ])
        .then(([redemVal, profileVal]) => {
            if (!profileVal || ! redemVal) {
                return {
                    statusCode: 422,
                    body: 'invalid message'
                }
            }

            return client.query(
                q.Get(
                    q.Match(q.Index('invitation-by-code'), code)
                )
            )
        })
        .then(() => {
            return ssc.importKeys({
                public: PUBLIC_KEY,
                private: SECRET_KEY
            })
        })
        .then(keys => {
            return ssc.createMsg(keys, null, {
                type: 'follow',
                contact: redemption.author
            })
        })

        // here we delete the invitation and write a follow message
        .then(_msg => {
            return client.query(
                q.Do(
                    q.Delete(
                        // delete the invitation since it was
                        // used now
                        q.Select(
                            ["ref"],
                            q.Get(
                                q.Match(
                                    q.Index('invitation-by-code'),
                                    code
                                )
                            )
                        )
                    ),

                    q.Create(q.Collection('follow'), {
                        data: {
                            key: ssc.getId(_msg),
                            value: _msg
                        }
                    }),

                    // also in here, save the `profile` msg
                    // to the profile collection
                    q.Create(q.Collection('profiles'), {
                        data: {
                            key: ssc.getId(profile),
                            value: profile
                        }
                    })
                )
            )
        })
        .then(res => {
            return {
                statusCode: 200,
                body: JSON.stringify(res.data)
            }
        })
        .catch(err => {
            if (err.toString().includes('instance not found')) {
                return {
                    statusCode: 404,
                    body: 'invitation not found'
                }
            }
            
            return {
                statusCode: 500,
                body: 'something broke'
            }
        })

}
