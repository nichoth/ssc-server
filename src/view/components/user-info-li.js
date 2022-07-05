import { html } from 'htm/preact'
import Markdown from 'preact-markdown'
const cloudinaryUrl = require('@nichoth/blob-store/cloudinary/url')
import { scale } from "@cloudinary/url-gen/actions/resize";
const { CLOUDINARY_CLOUD_NAME } = require('../config.json')

const cld = cloudinaryUrl({
    cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
    url: {
        secure: true // force https, set to false to force http
    }
})

// this is the little post that you see in the list on the home page

function UserInfo (props) {
    const { profile } = props

    return html`<div class="user-info">
        <a class="user-link" href="/${post.value.author}">
            <span class="author-image">
                <img src=${authorImg} alt="user avatar" />
            </span>

            <span class="author-name">
                ${authorProfile.username}
                <span class="is-you">
                    ${post.value.author === me.did ?
                        ' (you)' :
                        null
                    }
                </span>
            </span>
        </a>
    </div>`
}
