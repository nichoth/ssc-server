import { html } from 'htm/preact'
import Markdown from 'preact-markdown'
const remark = require('remark')
import cidToUrl from 'remark-image-cid-to-url/browser'
import remarkParse from 'remark-parse'

const cloudinaryUrl = require('@nichoth/blob-store/cloudinary/url')
import { scale } from "@cloudinary/url-gen/actions/resize";
const { CLOUDINARY_CLOUD_NAME } = require('../../config.json')

const cld = cloudinaryUrl({
    cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
    url: {
        secure: true // force https, set to false to force http
    }
})



function Post (props) {
    const { me, post, authorProfile } = props

    const authorImg = authorProfile ?
        (cld
            .image(encodeURIComponent(authorProfile.image))
            .resize( scale().width(100) )
            .format('auto')
            .toURL()) :
        ''

        const url = (cld
            .image(encodeURIComponent(post.value.content.mentions[0]))
            .resize( scale().width(400) )
            .format('auto')
            .toURL())

    return html`<li class="post">
        <a href="/post/${encodeURIComponent(post.key)}">
            <img src=${url} />
            <p>${post.value.content.text}</p>
        </a>

        <hr />

        <div class="user-info">
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
        </div>
    </li>`

}

module.exports = Post
