import { html } from 'htm/preact'
import { useState, useEffect } from 'preact/hooks';
const cloudinaryUrl = require('@nichoth/blob-store/cloudinary/url')
import { scale } from "@cloudinary/url-gen/actions/resize";
const { CLOUDINARY_CLOUD_NAME } = require('../config.json')
const evs = require('../EVENTS')

const cld = cloudinaryUrl({
    cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
    url: {
        secure: true // force https, set to false to force http
    }
})

function Profile (props) {
    console.log('profile props', props)
    const { me, splats, profiles, feeds, emit, client } = props
    const [copied, setCopied] = useState(false)

    const userDid = 'did:key:' + splats[0]

    var profile = (me.following || {})[userDid] ?
        me.following[userDid] :
        (profiles || {})[userDid]

    if (me.did === userDid) {
        profile = me.profile
    }

    useEffect(() => {
        if (feeds[userDid]) return
        client.getFeed(userDid)
            .then(res => {
                const ev = {}
                ev[userDid] = res
                emit(evs.feed.got, ev)
            })
    }, [userDid])

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

    const feed = feeds[userDid]

    if (!feed) return null

    return html`<div class="route profile">
        <div class="user-info">
            <div class="user-text-info">
                <h2>${profile.username}</h2>

                <p>
                    ${'DID '}
                    <button class="icon" onclick=${copyDid}>
                        <img class="copy-icon" src="/copy-solid.svg" title="copy" />
                    </button>
                    ${copied ?
                        html`<span class="has-copied">copied!</span>` :
                        null
                    }
                    <pre><code>${me.did}</code></pre>
                </p>
            </div>

            <div class="profile-image">
                <img src=${avatarUrl} alt="user's avatar" />
            </div>
        </div>

        <hr />

        <ul class="user-feed">
            ${feed.map(post => {
                const url = (cld
                    .image(post.value.content.mentions[0])
                    .resize( scale().width(600) )
                    .format('auto')
                    .toURL())

                return html`<li class="post">
                    <a href="/post/${encodeURIComponent(post.key)}">
                        <img src=${url} />
                        <p>${post.value.content.text}</p>
                    </a>
                </li>`
            })}
        </ul>
    </div>`
}

module.exports = Profile
