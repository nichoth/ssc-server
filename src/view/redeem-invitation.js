import { html } from 'htm/preact'
import { useEffect, useState } from 'preact/hooks';
var TextInput = require('@nichoth/forms/preact/text-input')
var Button = require('@nichoth/forms/preact/button')
var ssc = require('@nichoth/ssc/web')

function createRedemption (code) {

    return function RedeemInvitation (props) {
        useEffect(() => {
            document.body.classList.add('invitation')
            
            // returned function will be called on component unmount 
            return () => {
                document.body.classList.remove('invitation')
            }
        }, [])

        var [errText, setErrText] = useState(null)
        var [resolving, setResolving] = useState(null)

        function redeem (ev) {
            ev.preventDefault()
            var code = ev.target.elements['invitation-code'].value
            console.log('**redeem this code**', code)

            setResolving(true)

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
                    setResolving(false)
                    return res.json()
                })
                .then(res => {
                    if (res) {
                        console.log('got a response', res)
                        props.setRoute('/')
                    }
                })
                .catch(err => {
                    setResolving(false)
                    console.log('errrrr', err)
                })
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
                    required=${true} value=${code}
                />
                <div>
                    <${Button} type="submit" isSpinning=${resolving}>
                        redeem the invitation
                    </${Button}>
                </div>
            </form>
        </div>`
    }

}


module.exports = createRedemption
