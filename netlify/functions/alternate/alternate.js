const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
// var createHash = require('create-hash')

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
        msg = body.msg
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    try {
        var did = ssc.getAuthor(msg)
        var pubKey = ssc.didToPublicKey(did).publicKey
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid message'
        }
    }

    var isVal
    try {
        isVal = await ssc.isValidMsg(msg, null, pubKey)
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

    // message is valid, so write to the DB

    // create an 'alternate' collection in DB
    // check to make sure the server is following the given did
    // if all is ok, write the message to the collection



}
