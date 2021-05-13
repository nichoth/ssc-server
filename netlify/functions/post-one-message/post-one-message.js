require('dotenv').config()
var ssc = require('@nichoth/ssc')
var faunadb = require('faunadb')
var upload = require('./upload')

// requests are like
// { keys: { public }, msg: {} }


// "msg": {
//     "previous": null,
//     "sequence": 1,
//     "author": "@vYAqxqmL4/WDSoHjg54LUJRN4EH9/I4A/OFrMpXIWkQ=.ed25519",
//     "timestamp": 1606692151952,
//     "hash": "sha256",
//     "content": {
//         "type": "test",
//         "text": "waaaaa"
//     },
//     "signature": "wHdXRQBt8k0rFEa9ym35pNqmeHwA+kTTdOC3N6wAn4yOb6dsfIq/X0JpHCBZVJcw6Luo6uH1udpq12I4eYzBAw==.sig.ed25519"
// }



exports.handler = function (ev, ctx, cb) {
    try {
        var { keys, msg, file, hash } = JSON.parse(ev.body)
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



    // need to check that the message has a mention for the given image



    // ------------------ start doing things ---------------------



    var q = faunadb.query
    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })

    // see https://github.com/ssb-js/ssb-validate/blob/main/index.js#L149

    // get an existing feed
    // to check if the merkle list matches up
    client.query(
        q.Get(
            q.Match(q.Index('author'), '@' + keys.public)
        )
    )
        .then(res => {
            console.log('res', res)
            console.log('res.data.key', res.data.key)
            console.log('msg.previous', msg.previous)

            if (res.data.key !== msg.previous) {
                console.log('mismatch!!!!!', res.data.key, msg.previous)
                return cb(null, {
                    statusCode: 422,
                    body: JSON.stringify({
                        ok: false,
                        error: new Error('mismatch previous')
                    })
                })
            }

            // msg list is ok, write it to DB
            return msgAndFile(msg, file/*, slugifiedHash*/)
                .then(res => {
                    return cb(null, {
                        statusCode: 200,
                        body: JSON.stringify({
                            ok: true,
                            res: res[0]
                        })
                    })
                })
                .catch(err => cb(null, {
                    statusCode: 500,
                    body: JSON.stringify({
                        ok: false,
                        error: err
                    })
                }))
        })
        .catch(err => {
            if (err.name === 'NotFound') {
                // write the msg b/c the feed is new
                return msgAndFile(msg, file/*, slugifiedHash*/)
                    .then(res => {
                        cb(null, {
                            statusCode: 200,
                            body: JSON.stringify({
                                ok: true,
                                res: res[0]
                            })
                        })
                    })
                    .catch(err => cb(null, {
                        statusCode: 500,
                        body: JSON.stringify({
                            ok: false,
                            error: err
                        })
                    }))
            }

            return cb(null, {
                statusCode: 500,
                body: JSON.stringify({
                    ok: false,
                    error: err
                })
            })
        })


    function msgAndFile (msg, file, slug) {
        return Promise.all([
            writeMsg(msg),
            upload(file, slug)
        ])
            .catch((err) => {
                console.log('errrrrr', err)
                revert(msg, file, slug)
            })
    }


    // undo writing the msg or file
    function revert (msg, file, hash) {
        console.log('revert this one', msg, hash)
    }


    // return the new msg
    function writeMsg (msg) {
        var msgHash = ssc.getId(msg)

        // @TODO
        // should validate the shape of the msg before querying

        return client.query(
            q.Create(q.Collection('posts'), {
                key: msgHash,
                data: { value: msg, key: msgHash }
            })
        )
    }
}







