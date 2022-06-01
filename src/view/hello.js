import { html } from 'htm/preact'
var evs = require('../EVENTS')
import { useEffect, useState } from 'preact/hooks';
const { TextInput, Button } = require('@nichoth/forms/preact')
const EditableImg = require('./components/editable-img')
import { generateFromString } from 'generate-avatar'
import { Cloudinary } from '@cloudinary/url-gen';
const { CLOUDINARY_CLOUD_NAME } = require('../config.json')
const CopyButton = require('./components/copy-button')
const { LS_NAME } = require('../constants')
const dids = JSON.parse(window.localStorage.getItem(LS_NAME))
const Profile = require('../profile')

const cld = new Cloudinary({
    cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
    url: {
      secure: true // force https, set to false to force http
    }
})

function Hello (props) {
    console.log('*hello props*', props)
    const { profile, isAdmin } = props.me
    const { emit, me, client, setRoute } = props

    useEffect(() => {
        document.body.classList.add('hello')
        
        // returned function will be called on component unmount 
        return (() => document.body.classList.remove('hello'))
    }, [])

    const [resolving, setResolving] = useState(false)
    const [profileResolving, setProfileResolving] = useState(false)
    const [pendingProfile, setPendingProfile] = useState(null)

    function handleInput (ev) {
        setPendingProfile({
            image: (pendingProfile && pendingProfile.image) || null,
            username: ev.target.value
        })
    }

    function submitInvitation (ev) {
        ev.preventDefault()
        console.log('submit inv code', ev.target.elements.code.value)
        setResolving(true)
        // TODO -- should call our server here
        setTimeout(() => setResolving(false), 1000)
    }

    function selectImg (ev) {
        ev.preventDefault()
        console.log('on image select', ev)
        var file = ev.target.files[0]
        console.log('*file*', file)

        const reader = new FileReader()

        reader.onloadend = () => {
            console.log('*done reading file*')
            setPendingProfile({
                image: reader.result,
                username: (pendingProfile && pendingProfile.username) || null
            })
        }

        // this gives us base64
        reader.readAsDataURL(file)
    }

    function setProfile (ev) {
        ev.preventDefault()
        var { username, image } = pendingProfile
        image = image || null
        
        setProfileResolving(true)

        const existingHash = image ? null : profile.image

        // (did, username, existingImageHash, newImage)
        client.postProfile({
            did: me.did,
            username,
            imgHash: existingHash,
            image
        })
            .then(res => {
                setProfileResolving(false)
                console.log('*set profile response*', res)
                console.log('meeeeeeee', me)
                const { username, image } = res.db.value.content

                // this is just for localStorage
                Profile.set(res.db.value.content)

                emit(evs.identity.setProfile, {
                    // desc: '',
                    username,
                    image: image
                })

                setRoute('/')
            })
            .catch(err => {
                console.log('errrrrrrrrrrrr', err)
                setProfileResolving(false)
            })
        
    }

    const avatarUrl = (pendingProfile && pendingProfile.image) ?
        pendingProfile.image :
        (profile.image ?
            cld.image(encodeURIComponent(profile.image)).toURL() :
            ('data:image/svg+xml;utf8,' + generateFromString(me.did || ''))
        )


    return html`<div class="hello">
        <h1>Hello</h1>

        ${isAdmin ?
            html`<p>You have admin status for this server.</p>
                <p>Your DID is <code>${me.did}</code></p>

                <p>You have not yet set a profile for this identity. You can do
                    that now.</p>
                
                <form class="set-profile" onSubmit=${setProfile}>
                    <${TextInput} name="username" required=${true}
                        displayName="Your display name"
                        onInput=${handleInput}
                    />

                    <${EditableImg} url=${avatarUrl} name="image"
                        title="set your avatar"
                        onSelect=${selectImg}
                        label="Your avatar image"
                    <//>

                    <${Button} isSpinning=${profileResolving}
                        type="submit"
                        disabled=${!(pendingProfile &&
                            pendingProfile.username) || !pendingProfile.image}
                    >
                        Save your profile
                    <//>
                </form>
            ` :

            html`<h2>If you own this server</h2>
                <p>
                    <p>
                        Copy/paste the following DID into a file,
                        <code>/src/config.json</code>, in the key <code>admins</code>:
                    </p>

                    <${CopyButton} copyText=${me.did} />

                    <pre class="my-did">${me.did}</pre>
                    like this:
                    <pre class="json-example">
                        { "admins": [{ "did": "${me.did}" }] }
                    </pre>
                    then commit & push the repository to github.
                </p>

                <h2>If you do not own this server</h2>
                <p class="explain-server">You must be invited to use this server.</p>
                <p>Enter your invitation code here</p>

                <form onsubmit=${submitInvitation}>
                    <${TextInput} name="code" required=${true} />
                    <${Button} isSpinning=${resolving} type="submit">
                        Redeem invitation
                    <//>
                </form>
            `
        }

        ${(profile.err === 'invalid DID') ?
            html`
                <p class="explain-server">You must be invited to use this server.</p>
                <p>Enter your invitation code here</p>

                <form onsubmit=${submitInvitation}>
                    <${TextInput} name="code" />
                    <${Button} isSpinning=${resolving} type="submit">
                        Redeem invitation
                    <//>
                </form>
            ` :

            null
        }
    </div>`
}


module.exports = Hello
