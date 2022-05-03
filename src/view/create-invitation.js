import { html } from 'htm/preact'
var ssc = require('@nichoth/ssc/web')
import { useState } from 'preact/hooks';

function CreateInvitation (props) {
    // var { params } = props
    // var { key } = params

    // dont really need to check if we are followed in here, because
    // the link to this route only shows if you are followed,
    // and there is server side verification of following status when you
    //   submit the request

    // but there is the case where you have an ID, but the server is not 
    //   following you. Do we even want to support that scenario? Since
    //   this app is served from a certain domain, we could consider
    //   that domain to be the source of truth

    var { me } = props

    var [invitation, setInv] = useState(null)
    var [invErr, setErr] = useState(null)

    function createInv (ev) {
        ev.preventDefault()
        var msg = ssc.createMsg(me.secrets, null, {
            type: 'invitation',
            from: me.secrets.id
        })

        console.log('msgggggggg', msg)

        fetch('/.netlify/functions/create-invitation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // var { publicKey, msg } = req
            body: JSON.stringify({
                publicKey: me.secrets.public,
                msg: msg
            })
        })
            .then(res => {
                if (!res.ok) {
                    res.text().then(t => {
                        setErr(t)
                    })
                    return
                }
                return res.json()
            })
            .then(res => {
                if (res) setInv(res)
            })
    }

    if (invitation) {
        return html`<div class="create-invitation-route">
            <p>Invitation code: <code>${invitation.code}</code></p>
        </div>`
    }

    if (invErr) {
        return html`<div class="create-invitation-route">
            <p class="error">${invErr}</p>
        </div>`
    }

    return html`<div class="create-invitation-route">
        <p>invite someone</p>

        <form class="invitation" onSubmit=${createInv}>
            <button type="submit">create an invitation</button>
        </form>
    </div>`
}

module.exports = CreateInvitation
