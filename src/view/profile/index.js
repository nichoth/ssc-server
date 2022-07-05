import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
const cloudinaryUrl = require('@nichoth/blob-store/cloudinary/url')
import { scale } from "@cloudinary/url-gen/actions/resize";
const { CLOUDINARY_CLOUD_NAME } = require('../../config.json')
// const evs = require('../../EVENTS')
const Post = require('../post-li')

const cld = cloudinaryUrl({
    cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
    url: {
        secure: true // force https, set to false to force http
    }
})

function Profile (props) {
    console.log('profile props', props)
    const { me, profile, feed } = props
    const [copied, setCopied] = useState(false)

    if (!profile) return null

    const avatarUrl = (cld
        .image(encodeURIComponent(profile.image))
        .format('auto')
        .toURL()
    )

    function copyDid (ev) {
        ev.preventDefault()
        navigator.clipboard.writeText(me.did)
        setCopied(true)
    }

    if (!feed) return null

    return html`<div class="route profile">
        <div class="user-info">
            <div class="profile-image">
                <h2>${profile.username}</h2>

                <img src=${avatarUrl} alt="user's avatar" />
            </div>

            <div class="user-text-info">
                <p>
                    ${'DID '}
                    <button class="icon" onclick=${copyDid}>
                        <img class="copy-icon" src="/copy-solid.svg" title="copy" />
                    </button>
                    ${copied ?
                        html`<span class="has-copied">copied!</span>` :
                        null
                    }
                    <pre><code>${profile.about}</code></pre>
                </p>
            </div>
        </div>

        <hr />

        <ul class="user-feed">
            ${feed.map(post => {
                // const url = (cld
                //     .image(encodeURIComponent(post.value.content.mentions[0]))
                //     .resize( scale().width(600) )
                //     .format('auto')
                //     .toURL())

                const authorProfile = post.value.author === me.did ?
                    me.profile :
                    // TODO -- multiple users
                    me.following[post.value.author]

                return html` <${Post} me=${me} authorProfile=${authorProfile}
                    post=${post}
                />`

                // return html`<li class="post">
                //     <a href="/post/${encodeURIComponent(post.key)}">
                //         <img src=${url} />
                //         <p>${post.value.content.text}</p>
                //     </a>
                // </li>`
            })}
        </ul>
    </div>`
}

module.exports = Profile
