require('dotenv').config()

exports.handler = function (ev, ctx, cb) {
    console.log('file', file)

    // check that method is POST

    // check that savedPw === hash(req.pw)
    //    need a hash function from cli

    // if equal, write a follow msg to the DB
    //   { type: 'follow', contact: userId }

    var req = JSON.parse(ev.body)
    console.log('got req', req)

    return cb(null, {
        statusCode: 200,
        body: JSON.stringify({ ok: true })
    })
}
