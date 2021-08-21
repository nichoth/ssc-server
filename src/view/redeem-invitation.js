import { html } from 'htm/preact'
import { useEffect, useState } from 'preact/hooks';
var TextInput = require('@nichoth/forms/src/text-input')
var Button = require('@nichoth/forms/src/button')
var ssc = require('@nichoth/ssc')

function RedeemInvitation (props) {
    useEffect(() => {
        document.body.classList.add('invitation')
        
        // returned function will be called on component unmount 
        return () => {
            document.body.classList.remove('invitation')
        }
    }, [])

    var [errText, setErrText] = useState(null)

    function redeem (ev) {
        ev.preventDefault()
        // console.log('redeem an invitation', ev)
        var code = ev.target.elements['invitation-code'].value
        console.log('**redeem this code**', code)

        fetch('/.netlify/functions/redeem-invitation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicKey: props.me.secrets.public,
                code: code,
                signature: ssc.sign(props.me.secrets, code)
            })
        })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(t => {
                        console.log('got errrrr', t)
                        setErrText(t)
                    })
                }
                return res.json()
            })
            .then(res => {
                if (res) {
                    console.log('got a response', res)
                    props.setRoute('/')
                }
            })
            .catch(err => console.log('errrrr', err))

        // call the server endpoint
    }

    if (errText) {
        return html`<div class="redeem-invitation-route">
            <div class="error">
                ${errText}
            </div>
        </div>`
    }

    return html`<div class="redeem-invitation-route">
        <p>You need an invitation to use this server</p>

        <form class="redeem" onSubmit=${redeem}>
            <${TextInput} name="invitation-code" displayName="Invitation code"
                required=${true}
            />
            <div>
                <${Button} type="submit">redeem the invitation</${Button}>
            </div>
        </form>
    </div>`
}

module.exports = RedeemInvitation
