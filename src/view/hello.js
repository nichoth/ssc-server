import { html } from 'htm/preact'
var evs = require('../EVENTS')
import { useEffect, useState } from 'preact/hooks';
const { TextInput, Button } = require('@nichoth/forms/preact')
const ssc = require('@nichoth/ssc/web')
const EditableImg = require('./components/editable-img')
import { generateFromString } from 'generate-avatar'


function Hello (props) {
    console.log('*hello props*', props)
    const { profile, isAdmin } = props.me
    // const { avatarUrl } = profile
    const { emit, me, admins, client } = props

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

    console.log('*pending profile*', pendingProfile)

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
        var { username } = ev.target.elements
        username = username.value
        if (username === profile.username) return
        // image = image.value
        console.log('set profile', username)
        
        setProfileResolving(true)
        // (did, username, image)
        client.postProfile(me.did, username, null)
            .then(res => {
                setProfileResolving(false)
                console.log('post profile res', res)
                res.json().then(json => {
                    console.log('*json*', json)
                    emit(evs.identity.setUsername, { username: json.username })
                }) 
            })
            .catch(err => {
                console.log('errrrrrrrrrrrr', err)
                setProfileResolving(false)
            })
        
    }

    const adminNeedsProfile = !!(isAdmin && profile.hasFetched && profile.err)

    console.log('*is admin*', isAdmin)
    console.log('*admin needs profile*', adminNeedsProfile)

    const avatarUrl = (pendingProfile && pendingProfile.image) ?
        pendingProfile.image :
        (profile.avatarUrl ||
            ('data:image/svg+xml;utf8,' + generateFromString(me.did || '')))

    // if the `admins` key exists in the JSON, then we don't show info for a
    // potential admin
    // if there is no admin field, then we show instructions for the admin
    return html`<div class="hello">
        <h1>Hello</h1>

        ${!admins ?
            html`<h2>If you own this server</h2>
                <p>
                    Copy/paste the following DID into a file,
                    <code>/src/config.json</code>, in the key <code>admins</code>:
                    <pre>${me.did}</pre>
                    like this:
                    <pre>{ "admins": [{ "did": "${me.did}" }] }</pre>
                    then commit & push the repository to github.
                </p>
            ` :
            null
        }

        ${isAdmin ?
            null :
            null
        }

        ${(profile.err === 'invalid DID' && !isAdmin) ?
            html`
                ${!admins ?
                    html`<h2>If you do not own this server</h2>` :
                    null
                }
                <p class="explain-server">You must be invited to use this server.</p>
                <p>Enter your invitation code here</p>

                <form onsubmit=${submitInvitation}>
                    <${TextInput} name="code" />
                    <${Button} isSpinning=${resolving} type="submit">
                        Redeem invitation
                    <//>
                </form>
            ` :

            // has profile err, and is admin
            // this means you are an admin, but don't yet have profile data
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
            `
        }
    </div>`
}

function uploadAvatar (file, me) {
    const { did, profile } = me
    const { username } = profile

    return sha256(file).then(hash => {
        const msg = ssc.createMsg(me.keys, null, {
            type: 'profile',
            about: did,
            username,
            avatar: hash
        })

        return fetch('/.netlify/functions/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ msg, file })
        })
    })
}

module.exports = Hello


