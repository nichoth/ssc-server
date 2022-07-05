import { html } from 'htm/preact'
import Markdown from 'preact-markdown'
const cloudinaryUrl = require('@nichoth/blob-store/cloudinary/url')
import { scale } from "@cloudinary/url-gen/actions/resize";
const { CLOUDINARY_CLOUD_NAME } = require('../../../config.json')

const cld = cloudinaryUrl({
    cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
    url: {
        secure: true // force https, set to false to force http
    }
})

// this is the little post that you see in the list on the home page

function Post (props) {
    const { post } = props
    const url = (cld
        .image(encodeURIComponent(post.value.content.mentions[0]))
        .resize( scale().width(400) )
        .format('auto')
        .toURL())

            // <${Markdown} markdown=${post.value.content.text} />

    return html`<li class="post">
        <a href="/post/${encodeURIComponent(post.key)}">
            <img src=${url} />
        </a>
    </li>`

}

module.exports = Post
