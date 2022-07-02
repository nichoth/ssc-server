// let cloudinary = require("cloudinary").v2;
const BlobStore = require('@nichoth/blob-store/cloudinary')
const blobStore = BlobStore({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// cloudinary.config({ 
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// })

// function upload (file, hash) {
function upload (file) {
    // var slugifiedHash = encodeURIComponent('' + hash)

    return blobStore.write(file)

    // return new Promise(function (resolve, reject) {
    //     cloudinary.uploader.upload(file, {
    //         public_id: slugifiedHash,
    //         resource_type: 'auto',
    //         overwrite: true
    //     }, function (err, res) {
    //         if (err) return reject(err)
    //         resolve(res)
    //     })
    // })
}

module.exports = upload
