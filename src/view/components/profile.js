import { html } from 'htm/preact'
const cloudinaryUrl = require('@nichoth/blob-store/cloudinary/url')
import { scale } from "@cloudinary/url-gen/actions/resize";
const { CLOUDINARY_CLOUD_NAME } = require('../../config.json')
const cld = cloudinaryUrl({
    cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
    url: {
        secure: true // force https, set to false to force http
    }
})

function Profile ({ profile, className, href }) {
    const { username, image } = profile

    const imageUrl = (cld
        .image(encodeURIComponent(image))
        .resize( scale().width(100) )
        .format('auto')
        .toURL())

    return html`<div class=${'mini-profile' + (className ? (' ' + className) : '')}>
        <a class="profile-link" href=${href}>
            <img src=${imageUrl} />
            <span>${username}</span>
        </a>
    </div>`
}

module.exports = Profile
