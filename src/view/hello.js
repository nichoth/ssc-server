import { html } from 'htm/preact'
// var evs = require('../EVENTS')
import { useEffect, useState } from 'preact/hooks';
const { TextInput, Button } = require('@nichoth/forms/preact')
const { admins } = require('../config.json')
const EditableImg = require('./components/editable-img')

function Hello (props) {
    console.log('*hello props*', props)
    const profile = props.me.profile
    const { avatarUrl } = profile
    const { emit, admins } = props

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

    return html`<div class="hello">
        <h1>Hello</h1>


        ${!admins ?
            html`<h2>If you own this server</h2>
                <p>
                    Copy/paste the following DID into a file,
                    <code> /src/config.json</code>, in the key <code>admins</code>:
                    <pre>{"admins": [ "my-did" ]}</pre>,
                    then commit & push the repository to github.
                </p>
            ` :
            null
        }

        ${profile.err === 'invalid DID' ?
            html`<h2>If you do not own this server</h2>
            <p class="explain-server">You must be invited to use this server.</p>
            <p>Enter your invitation code here</p>

            <form onsubmit=${submitInvitation}>
                <${TextInput} name="code" />
                <${Button} isSpinning=${resolving} type="submit">
                    Redeem invitation
                <//>
            </form>` :

            html`<form class="set-profile" onSubmit=${setProfile}>
                <${TextInput} name="username" />
                
                <${EditableImg} url=${avatarUrl} name="image"
                    title="set your avatar"
                    onSelect=${selectImg}
                <//>

            </form>`
        }
    </div>`
}

module.exports = Hello
