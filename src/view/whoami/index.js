import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
import { Cloudinary } from '@cloudinary/url-gen';
const EditableTextarea = require('../components/editable-textarea')
const evs = require('../../EVENTS')

const cld = new Cloudinary({
    cloud: { cloudName: process.env.CLOUDINARY_CLOUD_NAME },
    url: {
      secure: true // force https, set to false to force http
    }
})

function Whoami (props) {
    const { me, client, emit } = props
    const [copied, setCopied] = useState(false)

    function copyDid (ev) {
        ev.preventDefault()
        navigator.clipboard.writeText(me.did)
        setCopied(true)
    }
    const avatarUrl = me.profile.image ?
        cld.image(encodeURIComponent(me.profile.image)).toURL() :
        ('data:image/svg+xml;utf8,' + generateFromString((me && me.did) || ''))

    function saveDesc (desc) {
        console.log('*save desc*', desc)

        console.log('img', me.profile.image)

        // postProfile: function (did, username, imgHash, image, desc) {
        client.postProfile({
            did: me.did,
            username: me.profile.username,
            imgHash: me.profile.image,
            image: null,
            desc
        })
            .then(res => {
                console.log('resssssssssssssssssss', res)
                console.log('description', res.db.data.value.content.desc)
                emit(evs.identity.setDesc, res.db.data.value)

            })
            .catch(err => {
                console.log('errrrrrrrrrrrrrrrrrr', err)
            })

        return new Promise ((resolve, reject) => {
            setTimeout(() => resolve('woooo'), 1000)
        })
    }

    return html`<div class="route whoami">
        <h1>who am i?</h1>

        ${me.isAdmin ?
            html`<p>You have admin status for this server.</p>` :
            null
        }

        <div class="my-profile">
            <img src=${avatarUrl} />

            <dl>
                <dt>Your username</dt>
                <dd>${me.profile.username}</dd>

                <dt>Description</dt>
                <dd>
                    <${EditableTextarea} value=${me.profile.description}
                        onSave=${saveDesc}
                        name="description"
                    />
                </dd>
            </dl>
        </div>

        <p>
            Your DID
            <button class="icon" onclick=${copyDid}>
                <img class="copy-icon" src="/copy-solid.svg" title="copy" />
            </button>
            ${copied ?
                html`<span class="has-copied">copied!</span>` :
                null
            }
            <pre><code>${me.did}</code></pre>
        </p>
    </div>`
}

module.exports = Whoami
