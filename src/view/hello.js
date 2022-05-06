import { html } from 'htm/preact'
// var evs = require('../EVENTS')
import { useEffect, useState } from 'preact/hooks';
const { TextInput, Button } = require('@nichoth/forms/preact')
// const { admins } = require('../config.json')
const EditableImg = require('./components/editable-img')
import { generateFromString } from 'generate-avatar'

function Hello (props) {
    console.log('*hello props*', props)
    const { profile, isAdmin } = props.me
    // const { avatarUrl } = profile
    const { emit, me, admins } = props

    useEffect(() => {
        document.body.classList.add('hello')
        
        // returned function will be called on component unmount 
        return (() => document.body.classList.remove('hello'))
    }, [])

    var [resolving, setResolving] = useState(false)

    function submitInvitation (ev) {
        ev.preventDefault()
        console.log('submit inv code', ev.target.elements.code.value)
        setResolving(true)
        // TODO -- should call our server here
        setTimeout(() => setResolving(false), 1000)
    }

    function selectImg (ev) {
        ev.preventDefault()
        console.log('on select', ev)
        var file = ev.target.files[0]
        console.log('*file*', file)

        const reader = new FileReader()

        reader.onloadend = () => {
            console.log('*done reading file*')
            emit(evs.identity.setAvatar, { file: reader.result })
        }

        // this gives us base64
        reader.readAsDataURL(file)
    }

    function setProfile (ev) {
        ev.preventDefault()
        var { username, image } = ev.target.elements
        username = username.value
        image = image.value
        console.log('set profile', username, image)
    }

    const adminNeedsProfile = !!(isAdmin && profile.hasFetched && profile.err)

    console.log('*is admin*', isAdmin)
    console.log('*admin needs profile*', adminNeedsProfile)

    const avatarUrl = (profile.avatarUrl ||
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
                    <code> /src/config.json</code>, in the key <code>admins</code>:
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
            html`<p>You have admin status for this server.</p>
                <p>Your DID is <code>${me.did}</code></p>

                <p>You have not yet set a profile for this identity. You can do
                    that now.</p>
                
                <form class="set-profile" onSubmit=${setProfile}>
                    <${TextInput} name="username"
                        displayName="Your display name"
                    />
                    
                    <${Button} type="submit">Save user name<//>
                </form>

                <${EditableImg} url=${avatarUrl} name="image"
                    title="set your avatar"
                    onSelect=${selectImg}
                    label="Your avatar image"
                <//>
            `
        }
    </div>`
}

module.exports = Hello
