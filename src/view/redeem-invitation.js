import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks';

function RedeemInvitation (props) {
    // var { params } = props
    // var { key } = params

    console.log('redeem invitation props', props)

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
            <button type="submit">redeem an invitation</button>
        </form>
    </div>`
}

module.exports = RedeemInvitation
