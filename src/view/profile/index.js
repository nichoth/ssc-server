import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
const cloudinaryUrl = require('@nichoth/blob-store/cloudinary/url')
import { scale } from "@cloudinary/url-gen/actions/resize";
const { CLOUDINARY_CLOUD_NAME } = require('../../config.json')
const Post = require('../components/post-li')

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
        .resize( scale().width(600) )
        .toURL()
    )

    function copyDid (ev) {
        ev.preventDefault()
        navigator.clipboard.writeText(profile.about)
        setCopied(true)
    }

    if (!feed) return null

    const isFollowing = me.following[profile.about]

    function startFollowing (ev) {
        console.log('start following', ev)
        ev.preventDefault()
    }

    function unfollow (ev) {
        console.log('unfollow', ev)
        ev.preventDefault()
    }

    return html`<div class="route profile">
        <div class="profile-user-info">
            <div class="profile-image">
                <h2>${profile.username}</h2>

                <img src=${avatarUrl} alt="user's avatar" />
            </div>

            <div class="user-text-info">
                ${me.did === profile.about ?
                    null :
                    isFollowing ?
                        html`<div class="follow-controls is-following">
                            <button onclick=${unfollow} title="unfollow">
                                <i class="fa fa-asterisk" aria-hidden="true"></i>
                            </button>
                            <span>following</span>
                        </div>` :

                        html`<div class="follow-controls not-following">
                            <button onclick=${startFollowing} title="follow this user">
                                <i class="fa fa-asterisk" aria-hidden="true"></i>
                            </button>
                            <span>not following</span>
                        </div>`
                }

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
                return html` <${Post} post=${post} />`
            })}
        </ul>
    </div>`
}

module.exports = Profile
