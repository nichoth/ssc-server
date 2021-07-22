require('dotenv').config()
var pwds = require('../passwords.json')
var hash = require('../../../hash')

exports.handler = function (ev, ctx, cb) {
    console.log('file', file)

    if (ev.httpMethod !== 'POST') {
        return cb(null, {
            statusCode: 400,
            body: (new Error('should be a post request')).toString()
        })
    }

    // check that method is POST

    // check that savedPw === hash(req.pw)
    //    need a hash function from cli

    // if equal, write a follow msg to the DB
    //   { type: 'follow', contact: userId }

    var req = JSON.parse(ev.body)
    console.log('got req', req)

    var { password, user } = req

    var ok = pwds[hash(password)]

    if (ok) {
        // in here, write to DB
        return client.query(
            q.Create(q.Collection('server-following'), {
                data: { type: 'follow', contact: user }
            })
        )
            .then(res => {
                return cb(null, {
                    statusCode: 200,
                    body: JSON.stringify(res.data)
                })
            })
    }

    return cb(null, {
        statusCode: 401,
        body: (new Error('Invalid password')).toString()
    })
}
