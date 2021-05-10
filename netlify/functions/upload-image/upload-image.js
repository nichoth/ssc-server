let cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = function (ev, ctx, cb) {
    var { file } = JSON.parse(ev.body)

    cloudinary.uploader.upload(file, function (err, res) {
        if (err) {
            return cb(null, {
                statusCode: 500,
                body: JSON.stringify({
                    ok: false,
                    message: 'boooo cloudinary'
                })
            })
        }

        return cb(null, {
            statusCode: 200,
            body: JSON.stringify({
                ok: true,
                message: 'ok woo'
            })
        })
    })

} 
