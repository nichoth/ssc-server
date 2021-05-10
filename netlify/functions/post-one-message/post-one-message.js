require('dotenv').config()
var ssc = require('@nichoth/ssc')
var faunadb = require('faunadb')

var cloudinary = require('cloudinary').v2;
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


var multer = require('multer')

const streamifier = require('streamifier')

const fileUpload = multer()

var middleWare = fileUpload.single('image')



// -----------------------------------------------
// https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud

app.post('/upload', fileUpload.single('image'), function (req, res, next) {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                }
            );
    
           streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    
    async function upload(req) {
        let result = await streamUpload(req);
        console.log('**result**', result);
    }
    
    upload(req);
});


// -----------------------------------------------





// https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud

// https://dev.to/ebereplenty/image-upload-to-cloudinary-with-nodejs-and-dotenv-4fen




// https://cloudinary.com/documentation/node_integration#quick_example_file_upload
// https://cloudinary.com/documentation/upload_images#file_source_options
// cloudinary.uploader.upload("my_image.jpg", (err, res) => {
//     console.log(err, res)
// });


// need to get the file from request
const data = {
    image: request.body.image,
};

cloudinary.uploader.upload(data.image, (err, res) => {
    console.log(err, res)
});

// need to upload from the incoming request






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


    // --------- start doing things ---------------------

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

            writeMsg(msg)
        })
        .catch(err => {
            if (err.name === 'NotFound') {
                // write the msg b/c the feed is new
                return writeMsg(msg)
            }

            return cb(null, {
                statusCode: 500,
                body: JSON.stringify({
                    ok: false,
                    error: err
                })
            })
        })


//     msg: {
//         previous: null,
//         sequence: 1,
//         author: '@vYAqxqmL4/WDSoHjg54LUJRN4EH9/I4A/OFrMpXIWkQ=.ed25519',
//         timestamp: 1606692151952,
//         hash: 'sha256',
//         content: { type: 'test', text: 'woooo' },
//         signature: 'wHdXRQBt8k0rFEa9ym35pNqmeHwA+kTTdOC3N6wAn4yOb6dsfIq/X0JpHCBZVJcw6Luo6uH1udpq12I4eYzBAw==.sig.ed25519'
//     }


    // msg is valid, write it to DB
    // return the new msg to the client
    function writeMsg (msg) {
        var hash = ssc.getId(msg)

        client.query(
            q.Create(q.Collection('posts'), {
                key: hash,
                data: { value: msg, key: hash}
            })
        )
            .then(res => {
                // console.log('res here', res)
                cb(null, {
                    statusCode: 200,
                    body: JSON.stringify({
                        ok: true,
                        res: res,
                        msg: res.data
                    })
                })
            })
            .catch(err => {
                // console.log('errrrr in publish', err)
                cb(null, {
                    statusCode: 500,
                    body: JSON.stringify({
                        ok: false,
                        error: err
                    })
                })
            })
            
    }
}
