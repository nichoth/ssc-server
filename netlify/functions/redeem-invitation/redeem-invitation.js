require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

const { PUBLIC_KEY, SECRET_KEY } = process.env

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'invalid http method'
        }
    }

    var profile, redemption
    try {
        const body = JSON.parse(ev.body)
        profile = body.profile
        redemption = body.redemption
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    console.log('***msg***', redemption)
    console.log('***profile***', profile)

    if (!redemption.author || redemption.content.type !== 'redeem-invitation' ||
    profile.author !== redemption.author) {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    const { code } = redemption.content
    const key = ssc.didToPublicKey(redemption.author)

    return Promise.all([
        ssc.isValidMsg(redemption, null, key.publicKey),
        ssc.isValidMsg(profile, null, key.publicKey)
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
                        key: ssc.getId(profile),
                        value: profile
                    })
                )
            )
        })

        .catch(err => {
            console.log('errrrrrrrrr', err)
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
