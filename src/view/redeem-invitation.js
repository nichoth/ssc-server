import { html } from 'htm/preact'
// import { useEffect, useState } from 'preact/hooks';

function RedeemInvitation (props) {
    // var { params } = props
    // var { key } = params

    console.log('redeem invitation props', props)

    function redeem (ev) {
        ev.preventDefault()
    }

    return html`<div class="redeem-invitation-route">
        <p>You need an invitation to use this server</p>

        <form class="redeem" onSubmit=${redeem}>
            <button type="submit">redeem an invitation</button>
        </form>
    </div>`
}

module.exports = RedeemInvitation
