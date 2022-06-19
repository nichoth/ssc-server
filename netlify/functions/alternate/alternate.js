const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
var createHash = require('create-hash')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const { admins } = require('../../../src/config.json')
const { PUBLIC_KEY } = process.env
const upload = require('../upload')

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'invalid method'
        }
    }

    try {
        var { altMsg, newProfile, file } = JSON.parse(ev.body)
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    console.log('**new profile**', newProfile)


    try {
        var { publicKey } = ssc.didToPublicKey(altMsg.author)
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid message author'
        }
    }

    var isVal
    try {
        isVal = await ssc.isValidMsg(altMsg, null, publicKey)
    } catch (err) {
        return {
            statusCode: 422,
            body: 'errrrr invalid message errr'
        }
    }

    if (!isVal) {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    if (!altMsg.content.from || !altMsg.content.to) {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    const did = ssc.getAuthor(altMsg)

    if (!(did === altMsg.content.from)) {
        return {
            statusCode: 400,
            body: 'invalid message'
        }
    }

    const key = ssc.getId(altMsg)

    // if is an admin, create an alt
    if (admins.some(el => el.did === did)) {
        var hash = createHash('sha256')
        hash.update(file)
        const _hash = hash.digest('base64')

        if (_hash !== newProfile.content.image) {
            return {
                statusCode: 400,
                body: "Hash doesn't match"
            }
        }

        return upload(file, _hash).then((up) => {
            return client.query(
                q.Do([
                    q.Create(
                        q.Collection('alternate'),
                        { data: { key, value: altMsg } }
                    ),

                    q.Create(
                        q.Collection('profiles'),
                        {
                            data: {
                                key: ssc.getId(newProfile),
                                value: newProfile
                            }
                        }
                    )
                ])
            )
        })
            .then(res => {
                console.log('create response*** ', res)
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        alt: res[0].data,
                        profile: res[1].data
                    })
                }
            })

    }


    // here we check if the user is somone the server follows,
    // and if so, then we create the alt for them
    return client.query(
        q.If(
            q.IsEmpty(q.Match(
                q.Index('a_follows_b'),
                [ ssc.publicKeyToDid(PUBLIC_KEY), did ]
            )),
            // is empty, means the server doesn't follow them
            'empty',

            // is not empty, so we write the 'alternate' message to DB
            q.Create(
                q.Collection('alternate'),
                { data: { key, value: altMsg } }
            )
        )
    )
        .then(doc => {
            if (doc === 'empty') {
                return {
                    statusCode: 403,
                    body: 'not allowed'
                }
            }

            return {
                statusCode: 200,
                body: JSON.stringify(doc.data)
            }
        })
        .catch(err => {
            if (err.toString().includes('instance not found')) {
                console.log('*not found*')
                return {
                    statusCode: 400,
                    body: 'not allowed'
                }
            }
            return {
                statusCode: 500,
                body: 'oh no'
            }
        })

}
