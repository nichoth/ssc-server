import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
import { Cloudinary } from '@cloudinary/url-gen';
const EditableTextarea = require('../components/editable-textarea')
const EditableImg = require('../components/editable-img')
const evs = require('../../EVENTS')
const { CLOUDINARY_CLOUD_NAME } = require('../../config.json')
const { TextInput, Button } = require('@nichoth/forms/preact')

const ls = window.localStorage
// localStorage.colorSetting = '#a4509b';


const cld = new Cloudinary({
    cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
    url: {
      secure: true // force https, set to false to force http
    }
})

function Whoami (props) {
    const { me, client, emit } = props
    const [copied, setCopied] = useState(false)
    const desc = me.profile.desc

    const [resolving, setResolving] = useState(false)
    const [pendingProfile, setPendingProfile] = useState(null)

    function copyDid (ev) {
        ev.preventDefault()
        navigator.clipboard.writeText(me.did)
        setCopied(true)
    }
    const avatarUrl = me.profile.image ?
        cld.image(encodeURIComponent(me.profile.image)).toURL() :
        ('data:image/svg+xml;utf8,' + generateFromString((me && me.did) || ''))

    function saveDesc (desc) {
        // postProfile: function (did, username, imgHash, image, desc) {
        client.postProfile({
            did: me.did,
            username: me.profile.username,
            imgHash: me.profile.image,
            image: null,
            desc
        })
            .then(res => {
                emit(evs.identity.setDesc, res.db.data.value)

            })
            .catch(err => {
                console.log('errrrrrrrrrrrrrrrrrr', err)
            })

        return new Promise ((resolve, reject) => {
            setTimeout(() => resolve('woooo'), 1000)
        })
    }

    function newId (ev) {
        ev.preventDefault()
        const els = ev.target.elements
        const { username } = els
        console.log('create new ID', username)
    }

    function selectNewAvatar (ev) {
        ev.preventDefault()
        // console.log('on image select', ev)
        var file = ev.target.files[0]
        console.log('*file*', file)

        const reader = new FileReader()

        reader.onloadend = () => {
            setPendingProfile({
                image: reader.result,
                username: (pendingProfile && pendingProfile.username) || null
            })
        }

        // this gives us base64
        reader.readAsDataURL(file)
    }

    function handleInput (ev) {
        setPendingProfile({
            image: (pendingProfile && pendingProfile.image) || null,
            username: ev.target.value
        })
    }

    const placeholderSvg = 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"> <circle cx="50" cy="50" r="50"/> </svg>'

    const dids = (JSON.parse(ls.getItem('dids')) || [])

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
                        value=${desc}
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

        <h2>Other DIDs</h2>
        <ul>
            ${dids.length ?
                    dids.map(did => {
                        return html`
                            <li>${did}</li>
                        `
                    }) :
                    html`<em>none</em>`
            }
        </ul>

        <hr />

        <h2>Create a new ID</h2>
        <p>Create and use a new identity.
        This will create a separate ID from any others you may have used.</p>


        <form class="new-id" onSubmit=${newId}>
            <${TextInput} name="Username" displayName="Username"
                required=${true}
                onInput=${handleInput}
            />

            <img src=/>


            <${EditableImg}
                url=${(pendingProfile && pendingProfile.image) || placeholderSvg}
                name="new-avatar-image"
                title="set your avatar"
                onSelect=${selectNewAvatar}
                label="New avatar image"
            />

            <div class="form-controls">
                <${Button} disabled=${!(pendingProfile &&
                    (pendingProfile.username || '').trim() &&
                    pendingProfile.image)}
                    type="submit"
                >
                    Create a new ID
                <//>
            </div>
        </form>
    </div>`
}

            // <label for="username">Username</label>
            // <input type="text" required=${true} id="username" name="username" />
                // <button type="submit" class="new-id">Create new ID</button>

module.exports = Whoami
