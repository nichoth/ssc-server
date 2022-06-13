import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
import { Cloudinary } from '@cloudinary/url-gen';
import { scale } from "@cloudinary/url-gen/actions/resize";
import { generateFromString } from 'generate-avatar'
const ssc = require('@nichoth/ssc/web')
const EditableTextarea = require('../components/editable-textarea')
const EditableImg = require('../components/editable-img')
const evs = require('../../EVENTS')
const { CLOUDINARY_CLOUD_NAME } = require('../../config.json')
const { TextInput, Button } = require('@nichoth/forms/preact')
const { LS_NAME } = require('../../constants')
const { admins } = require('../../config.json')
const placeholderSvg = require('../components/placeholder-svg')

console.log('LS_NAME', LS_NAME)

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
    }

    function createNewDid (ev) {
        ev.preventDefault()
        const { image, username } = pendingProfile
        console.log('***pending profile**', pendingProfile)

        // in here,
        //   * create a new keystore
        //   * save the DID and profile to the server
        //   * save the username to localStorage
        // the username must also be the name of the new keystore

        setResolving(true)
        
        ssc.createKeys(ssc.keyTypes.ECC, { storeName: username })
            .then(keystore => {
                return ssc.getDidFromKeys(keystore).then(newDid => {
                    const event = {}
                    event[newDid] = { username, did: newDid, image, keystore }

                    // then sign a message setting the profile for the new DID
                    return client.createAlternateDid({
                        newKeystore: keystore
                    })
                        .then(() => {
                            // now set the profile data (image and username) for the 
                            // new DID
                            client.setKeystore(keystore)

                            // now need to create profile info for that DID
                            return client.postProfile({ username, image })
                        })
                        .then(res => {
                            const dids = JSON.parse(ls.getItem(LS_NAME)) || {}

                            const imgId = res.db.value.content.image
                            const profile = {
                                username,
                                image: imgId,
                                storeName: username,
                                did: newDid
                            }
                            // update the localStorage object,
                            // then switch to the new ID
                            dids.lastUser = newDid
                            dids[newDid] = profile
                            ls.setItem(LS_NAME, JSON.stringify(dids))
                            // emit(evs.identity.newDid, event)
                            // the new keystore is in effect now
                            emit(evs.identity.change, {
                                did: newDid,
                                keystore,
                                profile
                            })
                            setPendingProfile(null)
                            setResolving(false)

                            // need to re-fetch the data that the app is using...
                        })
                })
            })
            .catch(err => {
                console.log('errrrrrrrrrrrrr', err)
                setResolving(false)
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

    function switchProfile (opts, ev) {
        ev.preventDefault()
        const { storeName, username, did, image } = opts
        console.log('switch profiles', opts)
        ssc.createKeys(ssc.keyTypes.ECC, { storeName })
            .then(keystore => {
                console.log('new keystore', keystore)
                const profile = { username, image }
                const dids = JSON.parse(window.localStorage.getItem(LS_NAME))
                // set the lastUser as the current DID
                dids.lastUser = did
                window.localStorage.setItem(LS_NAME, JSON.stringify(dids))
                emit(evs.identity.change, { keystore, did, profile })
            })
    }

    const dids = (JSON.parse(ls.getItem(LS_NAME)) || {})
    const lastUser = dids ? dids.lastUser : null

    // we filter for just the ones that are useful to see
    // (not the current user)
    const listOfUsers = (Object.keys(dids).length ?
        Object.keys(dids).map(key => {
            if (key === 'lastUser') return null
            if (dids[key].did === lastUser) return null
            const user = dids[key]
            return user
        }) :
        []).filter(Boolean)


    return html`<div class="route whoami">
        <h1>who am i?</h1>

        ${(admins.some(user => user.did === me.did)) ?
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

        <h2>Other Users</h2>
        <ul class="other-dids">
            ${listOfUsers.length ? 
                listOfUsers.map(user => {
                    const isAdmin = admins.some(admin => admin.did === user.did)
                    const avatarUrl = user.image ?
                        (cld
                            .image(encodeURIComponent(user.image))
                            .resize( scale().width(100) )
                            .toURL()) :
                        ('data:image/svg+xml;utf8,' +
                            generateFromString((user.did) || ''))

                    return html`<li>
                        <span class="avatar">
                            <img src=${avatarUrl} />
                        </span>
                        <span>${user.username}</span>
                        <button onClick=${switchProfile.bind(null, user)}>
                            switch to this profile
                        </button>
                        ${isAdmin ?
                            html`<span class="is-admin">admin</span>` :
                            null
                        }
                    </li>`
                }) :

                html`<em>none</em>`
            }
        </ul>

        <hr />

        <h2>Create a new ID</h2>
        <form class="new-id" onSubmit=${createNewDid}>
            <p>
                Create and use a new identity.
                This will create a separate ID from any others you may have
                used.
            </p>

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
