import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
import { Cloudinary } from '@cloudinary/url-gen';
const ssc = require('@nichoth/ssc/web')
const EditableTextarea = require('../components/editable-textarea')
const EditableImg = require('../components/editable-img')
const evs = require('../../EVENTS')
const { CLOUDINARY_CLOUD_NAME } = require('../../config.json')
const { TextInput, Button } = require('@nichoth/forms/preact')
const { LS_NAME } = require('../../constants')

const ls = window.localStorage

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
        return client.postProfile({
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

        // return new Promise ((resolve, reject) => {
        //     setTimeout(() => resolve('woooo'), 1000)
        // })
    }

    function createNewDid (ev) {
        ev.preventDefault()
        const { image, username } = pendingProfile
        console.log('***create new id**', pendingProfile)

        // in here,
        //   * create a new keystore
        //   * save the DID and profile to the server
        //   * save the username to localStorage
        // the username must also be the name of the new keystore

        setResolving(true)
        
        ssc.createKeys(ssc.keyTypes.ECC, { storeName: username })
            .then(keystore => {

                return ssc.getDidFromKeys(keystore).then(did => {
                    const dids = (JSON.parse(ls.getItem(LS_NAME)) || {})
                    dids[did] = { username, did }
                    ls.setItem(LS_NAME, JSON.stringify(dids))
                    const event = {}
                    event[did] = { username, did, image, keystore }
                    console.log('then post to the server and emit this event',
                        event)

                    return client.createNewProfile({
                        newKeystore: keystore,
                        username,
                        image
                    }).then(res => {
                        console.log('posted a new ID', res)
                        const dids = JSON.parse(ls.getItem(LS_NAME)) || {}
                        dids.lastUser = did
                        ls.setItem(LS_NAME, JSON.stringify(dids))
                        emit(evs.identity.newDid, event)
                        emit(evs.identity.change, { did, keystore })
                        setPendingProfile(null)
                    })
                })
            })
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
    const dids = (JSON.parse(ls.getItem(LS_NAME)) || {})

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
            ${Object.keys(dids).length ?
                    Object.keys(dids).map(key => {
                        return html`
                            <li>${dids[key].username}</li>
                        `
                    }) :
                    html`<em>none</em>`
            }
        </ul>

        <hr />

        <h2>Create a new ID</h2>
        <p>
            Create and use a new identity.
            This will create a separate ID from any others you may have used.
        </p>

        <form class="new-id" onSubmit=${createNewDid}>
            <${TextInput} name="Username" displayName="Username"
                required=${true}
                onInput=${handleInput}
            />

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
                    isSpinning=${resolving}
                    type="submit"
                >
                    Create a new ID
                <//>
            </div>
        </form>
    </div>`
}

module.exports = Whoami
