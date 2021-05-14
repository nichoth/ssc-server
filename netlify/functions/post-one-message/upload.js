let cloudinary = require("cloudinary").v2;
var createHash = require('crypto').createHash

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

function upload (file, _hash) {
    // var hash = createHash('sha256')
    // hash.update(file)

    // var slugifiedHash = ('' + hash.digest('base64')).replace(/\//g, "-")
    // var slugifiedHash = encodeURIComponent('' + hash.digest('base64'))

    // var buf = Buffer.from(file, 'base64')

    return new Promise(function (resolve, reject) {
        cloudinary.uploader.upload(file, {
            public_id: _hash
        }, function (err, res) {
            if (err) {
                return reject(err)
            }

            resolve(res)
        })

    })

}

module.exports = upload
