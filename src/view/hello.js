import { html } from 'htm/preact'
// var evs = require('../EVENTS')
import { useEffect, useState } from 'preact/hooks';
var { TextInput, Button } = require('@nichoth/forms/preact')
var { admins } = require('../config.json')

function Hello (props) {
    console.log('*hello props*', props)
    const profile = props.me.profile

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

    return html`<div class="hello">
        <h1>Hello</h1>

        ${profile.err === 'invalid DID' ?
            html`<p class="explain-server">You must be invited to use this server.</p>
            <p>Enter your invitation code here</p>

            <form onsubmit=${submitInvitation}>
                <${TextInput} name="code" />
                <${Button} isSpinning=${resolving} type="submit">
                    Redeem invitation
                <//>
            </form>` :
            html`<p>profile form goes here</p>`
        }
    </div>`
}

module.exports = Hello
