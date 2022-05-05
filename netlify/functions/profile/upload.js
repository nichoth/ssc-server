let cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

function upload (file, hash) {
    var slugifiedHash = encodeURIComponent('' + hash)

    return new Promise(function (resolve, reject) {
        cloudinary.uploader.upload(file, {
            public_id: slugifiedHash,
            overwrite: true
        }, function (err, res) {
            if (err) return reject(err)

            resolve(res)
        })
    })
}

module.exports = upload
