import { html } from 'htm/preact'
const { Button, TextInput } = require('@nichoth/forms/preact')
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
        const code = uuidv4()
        const note = ev.target.note.value

        ssc.createMsg(me.keys, null, {
            type: 'invitation',
            note,
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
            setInvCode(me.did + '--' + json.value.content.code)
            setCopied(false)
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
            <${TextInput} name="note" displayName="note"
                minlength="1" required=${false}
            />

            <${Button} disabled=${isResolving} type="submit"
                isSpinning=${isResolving}
            >
                Create an invitation
            <//>
        </form>
    </div>`
}

module.exports = CreateInvitation
