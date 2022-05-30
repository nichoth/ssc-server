import { html } from 'htm/preact'
const { Button } = require('@nichoth/forms/preact')
const { admins } = require('../config.json')
var ssc = require('@nichoth/ssc/web')
const { v4: uuidv4 } = require('uuid')
import { useState } from 'preact/hooks'
const CopyIcon = require('./components/copy-solid.js')

function CreateInvitation (props) {
    const { me } = props
    const [isResolving, setResolving] = useState(false)
    const [invCode, setInvCode] = useState(null)
    const [hasCopied, setCopied] = useState(false)
    const isAdmin = admins.some(admin => admin.did === me.did)

    if (!isAdmin) return html`<div class="route create-invitation">
        <div>You must have admin status to create an invitation</div>
    </div>`

    function createInv (ev) {
        ev.preventDefault()
        console.log('create an invitation')
        const code = uuidv4()

        ssc.createMsg(me.keys, null, {
            type: 'invitation',
            code
        }).then(msg => {
            setResolving(true)
            return fetch('/api/invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            })
        })
        .then(res => {
            setResolving(false)
            return res.json()
        })
        .then(json => {
            setInvCode(json.value.content.code)
        })
    }

    function copy (ev) {
        ev.preventDefault()
        navigator.clipboard.writeText(invCode)
        setCopied(true)
    }

    return html`<div class="route create-invitation">
        ${invCode ?
            html`<button class="copy" onClick=${copy} title="copy">
                <${CopyIcon} />
            </button>

            ${hasCopied ? html`<span class="has-copied">Copied!</span>` : null}

            <dl class="invitation-code">
                <dt>Invitation code</dt>
                <dd>${invCode}</dd>
            </dl>` :
            null
        }

        <form onsubmit=${createInv}>
            <${Button} disabled=${isResolving}
                isSpinning=${isResolving}
                type="submit"
            >
                Create an invitation
            <//>
        </form>
    </div>`
}

module.exports = CreateInvitation
