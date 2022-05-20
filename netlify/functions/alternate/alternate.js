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

    console.log('*msg*', msg)

    const did = ssc.getAuthor(msg)

    if (!(did === msg.content.from)) {
        return {
            statusCode: 400,
            body: 'invalid message'
        }
    }

    // check to make sure the server is following the given did
    // can look for profile by DID

    // if the given profile exists,
    // then create the alternate profile from the message data

    // need to check the lineage also
    // check if this profile is an alternate from another that is 'original'

    // the alternate messages are a linked list
    // foo -> bar -> baz

    // first get to:baz
    // then get to:bar
    // keep following the `to` field until you get no results
    // then check if `foo` is followed by this server or an _admin_

    return client.query(
        q.Get(q.Match(q.Index('profile-by-did'), did))
    )
        .then(doc => {
            console.log('doc', doc)
            // return doc
            return {
                statusCode: 200,
                body: JSON.stringify(doc.data)
            }
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
