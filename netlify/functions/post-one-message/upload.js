let cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

function upload (file, hash) {
    // console.log('**start upload**', hash)
    return new Promise(function (resolve, reject) {
        cloudinary.uploader.upload(file, {
            public_id: hash,
            overwrite: true
        }, function (err, res) {
            if (err) {
                return reject(err)
            }

            // console.log('**done uploading**', res)
            resolve(res)
        })
    })
}

module.exports = upload
