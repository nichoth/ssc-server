require('dotenv').config()
var ssc = require('@nichoth/ssc')
var unfollow = require('@nichoth/ssc-fauna/unfollow')

exports.handler = function (ev, ctx, cb) {
    // var req = JSON.parse(ev.body)
    if (ev.httpMethod !== 'POST') {
        return cb(null, {
            statusCode: 400,
            body: 'should be a POST request'
        })
    }

    var { keys, msg } = JSON.parse(ev.body)

    console.log('**** keys, msg ****', keys, msg)

    var isValid
    try {
        isValid = ssc.verifyObj(keys, null, msg)
    } catch (err) {
        return cb (null, {
            statusCode: 400,
            body: 'invalid message'
        })
    }

    if (!isValid) {
        return cb (null, {
            statusCode: 400,
            body: 'invalid message'
        })
    }

    // validation is ok
    // now do the thing
    unfollow.post(keys, msg)
        .then(res => {
            console.log('unfollow res', res)
            return cb(null, {
                statusCode: 200,
                body: JSON.stringify(res)
            })
        })
        .catch(err => {
            console.log('**errr in unfollow**', err)
            return cb(null, {
                statusCode: 500,
                body: err.toString()
            })
        })

}
