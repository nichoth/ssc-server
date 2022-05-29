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

    var msg
    try {
        msg = JSON.parse(ev.body)
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    if (!msg.author || msg.content.type !== 'redeem-invitation') {
        console.log('aaaaaaaaaaaa', msg)
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    const key = ssc.didToPublicKey(msg.author)

    return ssc.isValidMsg(msg, null, key.publicKey)
        .then(isVal => {
            if (!isVal) {
                console.log('bbbbbbbbbbbbbbb', msg)

                return {
                    statusCode: 422,
                    body: 'invalid message'
                }
            }




            return client.query(
                q.Get(
                    q.Match(q.Index('invitation-by-code'), msg.content.code)
                )
            )
                .then(() => {
                    // this should be a message signed by this server
                    return ssc.importKeys({
                        public: PUBLIC_KEY,
                        private: SECRET_KEY
                    })
                        .then(keys => {
                            return ssc.createMsg(keys, null, {
                                type: 'follow',
                                contact: msg.author
                            })
                        })
                        .then(_msg => {
                            return client.query(
                                q.Create(q.Collection('follow'), {
                                    data: {
                                        key: ssc.getId(_msg),
                                        value: _msg
                                    }
                                })
                            )
                        })
                        .then(res => {
                            return {
                                statusCode: 200,
                                body: JSON.stringify(res.data)
                            }
                        })
                })
                .catch(err => {
                    console.log('***errrrrrrrrrrr', err)
                    return {
                        statusCode: 500,
                        body: err.toString()
                    }
                })





        })
}
