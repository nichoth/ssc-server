import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks';
var TextInput = require('@nichoth/forms/src/text-input')

function RedeemInvitation (props) {
    useEffect(() => {
        document.body.classList.add('invitation')
        
        // returned function will be called on component unmount 
        return () => {
            document.body.classList.remove('invitation')
        }
    }, [])

    function redeem (ev) {
        ev.preventDefault()
        console.log('redeem an invitation', ev)
    }

    return html`<div class="redeem-invitation-route">
        <p>You need an invitation to use this server</p>

        <form class="redeem" onSubmit=${redeem}>
            <!-- <label for="invitation-code">Invitation code</label>
            <input type="text" class="invitation-code" id="invitation-code"
                name="invitation-code"
            /> -->
            <${TextInput} name="invitation-code" displayName="Invitation code"
                required=${true}
            />
            <div>
                <button type="submit">redeem an invitation</button>
            </div>
        </form>
    </div>`
}

module.exports = RedeemInvitation
