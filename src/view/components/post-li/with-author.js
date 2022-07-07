import { html } from 'htm/preact'
const cloudinaryUrl = require('@nichoth/blob-store/cloudinary/url')
import { scale } from "@cloudinary/url-gen/actions/resize";
const { CLOUDINARY_CLOUD_NAME } = require('../../../config.json')
const MiniProfile = require('../profile')

const cld = cloudinaryUrl({
    cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
    url: {
        secure: true // force https, set to false to force http
    }
})

function Post (props) {
    const { me, post, authorProfile } = props

    const url = (cld
        .image(encodeURIComponent(post.value.content.mentions[0]))
        .resize( scale().width(400) )
        .format('auto')
        .toURL())

    const isFollowing = !!(me.following[post.value.author])

    return html`<li class="post">
        <a href="/post/${encodeURIComponent(post.key)}">
            <img src=${url} />
        </a>

        <${MiniProfile} href=${'/@' + authorProfile.username}
            profile=${authorProfile}
            isFollowing=${isFollowing}
        />
    </li>`
}

module.exports = Post
