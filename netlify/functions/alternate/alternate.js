const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const { admins } = require('../../../src/config.json')

exports.handler = async function (ev, ctx) {
    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'invalid method'
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

    try {
        var { publicKey } = ssc.didToPublicKey(msg.author)
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid message author'
        }
    }

    var isVal
    try {
        isVal = await ssc.isValidMsg(msg, null, publicKey)
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

    if (!msg.content.from || !msg.content.to) {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    const did = ssc.getAuthor(msg)

    if (!(did === msg.content.from)) {
        return {
            statusCode: 400,
            body: 'invalid message'
        }
    }

    const key = ssc.getId(msg)

    // if is an admin, create an alt
    if (admins.some(el => el.did === did)) {
        return client.query(
            q.Create(
                q.Collection('alternate'),
                { data: { key, value: msg } }
            )
        ).then(res => {
            res.data.value.previous = (res.data.value.previous || null)

            return {
                statusCode: 200,
                body: JSON.stringify(res.data)
            }
        })
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


    // if they have a profile, then we are following them
    // so create an alt
    return client.query(
        q.Get(q.Match(q.Index('profile-by-did'), did))
    )
        .then(doc => {
            // TODO
            // in here, need to write the `aleternate` message to DB

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
