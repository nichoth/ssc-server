const BlobStore = require('@nichoth/blob-store/cloudinary')
const blobStore = BlobStore({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

function upload (file) {
    return blobStore.write(file)
}

module.exports = upload
