const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'invalid method'
        }
    }

    var msg
    try {
        const body = JSON.parse(ev.body)
        msg = body
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    // console.log('*msg*', msg)

    try {
        var { publicKey } = ssc.didToPublicKey(msg.author)
        console.log('**public key**', publicKey)
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid message author'
        }
    }

    var isVal
    try {
        console.log('*pub key*', publicKey)
        isVal = await ssc.isValidMsg(msg, null, publicKey)
        console.log('*is val*', isVal)
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

    // check to make sure the server is following the given did
    // can look for profile by DID
    const did = ssc.getAuthor(msg)
    console.log('*did*', did)
    return client.query(
        q.Get(q.Match(q.Index('profile-by-did'), did))
    )
        .then(doc => {
            console.log('doc', doc)
            return doc
        })
        .then(doc => {
            return { statusCode: 200, body: JSON.stringify(doc.data) }
        })
        .catch(err => {
            console.log('errrrrrr in here', err)
            if (err.toString().includes('instance not found')) {
                console.log('*not found*')
            }
            return {
                statusCode: 500,
                body: 'oh no'
            }
        })

    // if all is ok, write the message to the collection

}
