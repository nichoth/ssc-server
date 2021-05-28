require('dotenv').config()
var ssc = require('@nichoth/ssc')
var faunadb = require('faunadb')
var upload = require('./upload')
var createHash = require('crypto').createHash
var xtend = require('xtend')
var stringify = require('json-stable-stringify')

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
        var { keys, msg, file/*, slugifiedHash*/ } = JSON.parse(ev.body)
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

    console.log('aaaaaaaaaaaaaaaaa in the req', msg)

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


    var hash = createHash('sha256')
    hash.update(file)
    var _hash = hash.digest('base64')
    console.log('******hash', hash)
    var slugifiedHash = encodeURIComponent('' + _hash)



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
                console.log('**prev key**', res.data.key)
                console.log('**msg.previous key**', msg.previous)
                return cb(null, {
                    statusCode: 422,
                    body: JSON.stringify({
                        ok: false,
                        error: new Error('mismatch previous')
                    })
                })
            }

            // msg list is ok, write it to DB
            return msgAndFile(msg, file, slugifiedHash, _hash)
                .then(res => {
                    // make the url here for the image
                    // var imgHash = res[0].value.content.mentions[0]
                    var slugslug = encodeURIComponent(slugifiedHash)
                    var imgUrl = cloudinary.url(slugslug, {
                        // width: 100,
                        // height: 150,
                        // crop: "fill"
                    })      

                    var _response = xtend(res[0], {
                        mentionUrls: [imgUrl]
                    })

                    return cb(null, {
                        statusCode: 200,
                        body: JSON.stringify({
                            ok: true,
                            res: _response
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
                // console.log('**in err**', slugifiedHash, _hash)
                return msgAndFile(msg, file, slugifiedHash, _hash)
                    .then(res => {  
                        var slugslug = encodeURIComponent(slugifiedHash)

                        // we slugify twice
                        var imgUrl = cloudinary.url(slugslug, {
                            // width: 100,
                            // height: 150,
                            // crop: "fill"
                        })      

                        console.log('**imgUrl**', imgUrl)

                        // here, we add the url for the photo
                        var _response = xtend(res[0].data, {
                            mentionUrls: [imgUrl]
                        })

                        return cb(null, {
                            statusCode: 200,
                            body: JSON.stringify({
                                ok: true,
                                res: _response
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


    function msgAndFile (msg, file, slug, hash) {
        return Promise.all([
            writeMsg(msg, hash),
            upload(file, slug)
        ])
            .catch((err) => {
                console.log('errrrrr', err)
                revert(msg, file, slug)
            })
    }


    // undo writing the msg or file
    function revert (msg, file, slug) {
        console.log('revert this one', msg, slug)
    }


    // return the new msg
    function writeMsg (_msg, hash) {
        var msg = xtend(_msg, {
            content: xtend(_msg.content, {
                mentions: [hash]
            })
        })

        console.log('**strigigygy**', stringify(msg, null, 2))
        console.log('msg in here*****', msg)
        var msgHash = ssc.getId(msg)
        console.log('**hash**', msgHash)


        // we use the hash of the message *with* `mentions` array in it
        // thats what is written to the DB


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







