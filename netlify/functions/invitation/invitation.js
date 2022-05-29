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
    const did = msg.author

    if (!msg.author || msg.content.type !== 'invitation') {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    if ( !(admins.some(admin => admin.did === did)) ) {
        return {
            statusCode: 401,
            body: 'invalid DID'
        }
    }

    const key = ssc.didToPublicKey(msg.author)

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
