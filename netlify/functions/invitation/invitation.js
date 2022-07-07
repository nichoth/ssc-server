require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const { admins } = require('../../../src/config.json')

// this route is to *create* an invitation

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod === 'GET') {
        const { did } = ev.queryStringParameters

        if (did) {
            // get any invitations that *this DID has created*
            return client.query(
                q.Map(
                    q.Paginate(
                        q.Match( q.Index("invitation_by_inviter"), did )
                    ),
                    
                    q.Lambda( "invitation", q.Get(q.Var("invitation")) )
                )
            )
                .then(res => {
                    return {
                        statusCode: 200,
                        body: JSON.stringify(res.data.map(doc => {
                            delete doc.data.value.content.code
                            return doc.data
                        }))
                    }
                })
                .catch(err => {
                    return {
                        statusCode: 500,
                        body: err.toString()
                    }
                })
        }

        // q.Paginate(q.Documents(q.Collection('<your collection>'))),
        return client.query(
            q.Map(
                q.Paginate(
                    q.Documents(q.Collection('invitations'))
                ),

                q.Lambda("inv", q.Get(q.Var("inv")))
            )
        )
            .then(res => {
                return {
                    statusCode: 200,
                    body: JSON.stringify((res.data && res.data.lenghth) ?
                        res.data.map(doc => {
                            if (doc && doc.value && doc.value.content) {
                                delete doc.data.value.content.code
                            }
                            return doc.data
                        }) :

                        ''
                    )
                }
            })
            .catch(err => {
                return {
                    statusCode: 500,
                    body: err.toString()
                }
            })
    }

    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'invalid http method'
        }
    }

    // ------------- *is a POST request* -----------------------

    var msg
    try {
        msg = JSON.parse(ev.body)
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }
    const did = msg.author

    if (!msg.author || msg.content.type !== 'invitation') {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    if ( !(admins.some(admin => admin.did === did)) ) {
        return {
            statusCode: 403,
            body: 'invalid DID'
        }
    }

    const key = ssc.didToPublicKey(msg.author)

    const { code } = msg.content
    const [_did] = code.split('--')

    if (_did !== msg.author) {
        console.log('code', code)
        console.log('_did', _did)
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    return ssc.isValidMsg(msg, null, key.publicKey)
        .then(isVal => {
            if (!isVal) {
                return {
                    statusCode: 422,
                    body: 'invalid message'
                }
            }

            // msg and DID are ok, write to DB
            return writeInvitation({ msg })
                .then(res => {
                    return {
                        statusCode: 200,
                        body: JSON.stringify(res.data)
                    }
                })
        })
        .catch(err => {
            return {
                statusCode: 400,
                body: err.toString()
            }
        })
}

function writeInvitation ({ msg }) {
    const key = ssc.getId(msg)

    return client.query(
        q.Create(
            q.Collection('invitations'),
            { data: { key, value: msg } }
        )
    )
}
