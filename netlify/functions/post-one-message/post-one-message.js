require('dotenv').config()
var ssc = require('@nichoth/ssc')
var faunadb = require('faunadb')
var upload = require('./upload')
var xtend = require('xtend')
var createHash = require('../create-hash')

let cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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
        var { keys, msg, file } = JSON.parse(ev.body)
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

    // need to check that the message has a mention for the given image
    var hasMentions = (msg.content.mentions &&
        Array.isArray(msg.content.mentions))

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

    if (!msg || !hasMentions || !isValid) {
        // console.log('**msg**', msg)
        // console.log('**isValid**', isValid)
        // console.log('has mentions', hasMentions)
        // console.log('msg', msg)
        // is invalid
        // 422 (Unprocessable Entity)
        return cb(null, {
            statusCode: 422,
            body: 'invalid message'
        })
    }


    var q = faunadb.query
    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })

    // see https://github.com/ssb-js/ssb-validate/blob/main/index.js#L149

    

    // check that the keys.id is on the `allowed` list -- the list of
    // people that the server is following
    client.query(
        q.Get( q.Match(q.Index('server-following-who'), '@' + keys.public) )
    )
        .then((_res) => {
            console.log('zzzzzzzzzz', _res)
            // post the stuff
            doTheThings()
                .then(res => {
                    // console.log('**things done***', res)

                    cb(null, {
                        statusCode: 200,
                        body: JSON.stringify({
                            ok: true,
                            msg: res
                        })
                    })
                })
        })
        .catch(err => {
            // console.log('**not following****', err)
            // we are not following them
            return cb(null, {
                statusCode: 401,
                body: err.toString()
            })
        })


    // ------------------ start doing things ---------------------


    function doTheThings () {
        // create the hash
        var slugifiedHash = createHash(file)

        // get an existing feed
        // to check if the merkle list matches up
        return client.query(
            q.Get(
                q.Reverse( q.Match(q.Index('author'), '@' + keys.public) )
            )
        )
            .then(res => {
                if (res.data.key !== msg.previous) {
                    console.log('!!!!mismatch!!!!!', res.data.key, msg.previous)
                    console.log('**prev key**', res.data.key)
                    console.log('**msg.previous key**', msg.previous)

                    return cb(null, {
                        statusCode: 422,
                        body: JSON.stringify({
                            ok: false,
                            error: (new Error('mismatch previous')).toString()
                        })
                    })
                }

                // msg list is ok, write it to DB
                return msgAndFile(msg, file, slugifiedHash)
                    .then(res => {
                        // make the url here for the image
                        var imgUrl = cloudinary.url(slugifiedHash, {
                            // width: 100,
                            // height: 150,
                            // crop: "fill"
                        })

                        var _response = xtend(res[0], {
                            mentionUrls: [imgUrl]
                        })

                        return _response
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
                    return msgAndFile(msg, file, slugifiedHash)
                        .then(res => {  
                            var imgUrl = cloudinary.url(slugifiedHash, {
                                // width: 100,
                                // height: 150,
                                // crop: "fill"
                            })      

                            // here, we add the url for the photo
                            var _response = xtend(res[0].data || res[0], {
                                mentionUrls: [imgUrl]
                            })

                            return cb(null, {
                                statusCode: 200,
                                body: JSON.stringify({
                                    ok: true,
                                    msg: _response
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
    }

    function msgAndFile (msg, file, slug) {
        // console.log('**in msg and file**')
        return Promise.all([
            writeMsg(msg).then(res => {
                return res.data ? res.data : res
            }),
            upload(file, slug)
        ])
            .then(arr => {
                // console.log('**done with everything**', arr)
                return arr
            })
            .catch((err) => {
                console.log('errrrrr in post one', err)
                revert(msg, file, slug)
            })
    }


    // undo writing the msg or file
    function revert (msg, file, slug) {
        console.log('revert this one', msg, slug)
    }


    // return the new msg
    function writeMsg (_msg) {
        var msg = _msg
        var msgHash = ssc.getId(msg)

        // @TODO
        // should validate the shape of the msg before querying

        return client.query(
            q.Create(q.Collection('posts'), {
                key: msgHash,
                value: msg,
                // data: { value: msg, key: msgHash }
            })
        )
            .then(res => {
                // console.log('**done writing msg**', res)
                return res
            })
    }
}
