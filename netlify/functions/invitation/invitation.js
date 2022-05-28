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
                    statusCode: 400,
                    body: 'invalid message'
                }
            }

            // msg and DID are ok, write to DB
            return {
                statusCode: 200,
                body: JSON.stringify({ msg: 'ok!' })
            }
        })
        .catch(err => {
            console.log('*errrrrrr*', err)
            return {
                statusCode: 400,
                body: err.toString()
            }
        })

}
