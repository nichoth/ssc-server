var faunadb = require('faunadb')
var ssc = require('@nichoth/ssc')

// return the most recent 'about' msg
exports.handler = async function (ev, ctx) {
    var q = faunadb.query
    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })

    try {
        var { keys, msg } = JSON.parse(ev.body)
    } catch (err) {
        return cb(null, {
            statusCode: 422,
            body: JSON.stringify({
                ok: false,
                error: 'invalid json',
                message: err.message
            })
        })
    }



    // TODO -- should verify the msg with the previous in the chain




    var isValid
    try {
        isValid = ssc.verifyObj(keys, null, msg)
    } catch (err) {
        return cb(null, {
            statusCode: 422,
            body: JSON.stringify({
                ok: false,
                error: err,
                message: msg
            })
        })
    }

    if (!msg || !isValid) {
        // is invalid
        // 422 (Unprocessable Entity)
        return cb(null, {
            statusCode: 422,
            body: JSON.stringify({
                ok: false,
                error: 'invalid message',
                message: msg
            })
        })
    }

    var msgHash = ssc.getId(msg)

    var res = client.query(
        q.Create(q.Collection('abouts'), {
            data: { value: msg, key: msgHash }
        })
    )

    return res.then(res => {
        console.log('***res in here***', res)
        return {
            statusCode: 200,
            body: JSON.stringify(res.data)
        }
    })

}
