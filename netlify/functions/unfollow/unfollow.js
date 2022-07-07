require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
var faunadb = require('faunadb')
var q = faunadb.query

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'invalid http method'
        }
    }

    var msgs
    try {
        msgs = JSON.parse(ev.body)
    } catch(err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    if (!Array.isArray(msgs)) return {
        statusCode: 422,
        body: 'invalid messages'
    }
    
    const authorDid = msgs[0].author
    const authorOk = msgs.every(msg => (msg.author === authorDid))
    const msgsOk = msgs.every(msg => !!msg.content.contact)

    if (!msgsOk) return {
        statusCode: 422,
        body: 'invalid author'
    }

    
    if (!authorOk) return {
        statusCode: 422,
        body: 'invalid author'
    }

    const typeOk = msgs.every(msg => (msg.content.type === 'unfollow'))

    if (!typeOk) return {
        statusCode: 422,
        body: 'invalid message type'
    }

    const isValids = await Promise.all(msgs.map(msg => {
        const { publicKey } = ssc.didToPublicKey(msg.author)
        return ssc.isValidMsg(msg, null, publicKey)
    }))


    // need to look for an existing 'follow' message
    // and delete it if it exists


    if (!(isValids.every(Boolean))) {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    // TODO
    // we are doing a delete operation here
    // would want to change to an addition operation if this were distributed
    const client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })

    console.log('author did', authorDid)
    console.log('msg.contact', msgs[0].content.contact)

    return client.query(
        q.Map(
            msgs.map(msg => (msg.content.contact)),
            q.Lambda(
                "contact",
                q.If(
                    q.Exists(
                        q.Match(
                            q.Index('a_follows_b'),
                            [authorDid, q.Var("contact")]
                        )
                    ),

                    q.Delete(
                        q.Select(
                            ["ref"],
                            q.Get(
                                q.Match(
                                    q.Index('a_follows_b'),
                                    [authorDid, q.Var("contact")]
                                )
                            )
                        )
                    ),

                    'nothing to be done'
                )
            )
        )
    )
        .then(res => {
            return {
                statusCode: 200,
                body: JSON.stringify(res.map(doc => doc.data))
            }
        })
        .catch(err => {
            return {
                statusCode: 500,
                body: err.toString()
            }
        })



    // if there is a message that says a follows b,
    //   delete it
    // return client.query(
    //     q.If(
    //         q.IsEmpty(q.Match(
    //             q.Index('a_follows_b'),
    //             [ msgs[0].author, msgs[0].content.contact ]
    //         )),
    //         'nothing to delete',
    //         q.Do(
    //             q.Delete(
    //                 q.Select(
    //                     ["ref"],
    //                     q.Get(
    //                         q.Match(
    //                             q.Index('redemption-by-redeemer'),
    //                             msg.value.content.contact
    //                         )
    //                     )
    //                 )
    //             )
    //         )
    //     )
    // )
}
