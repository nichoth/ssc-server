const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
// var createHash = require('create-hash')

exports.handler = function (ev, ctx) {
    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'invalid method'
        }
    }

    var msg
    try {
        const body = JSON.parse(ev.body)
        msg = body.msg
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    const did = ssc.getAuthor(msg)
    const pubKey = ssc.didToPublicKey(did).publicKey

    var isVal
    try {
        isVal = ssc.isValidMsg(msg, null, pubKey)
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    if (!isVal) {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }



}
