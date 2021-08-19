import { html } from 'htm/preact'
// import { useEffect, useState } from 'preact/hooks';

function CreateInvitation (props) {
    // var { params } = props
    // var { key } = params

    console.log('create invitation props', props)

    // dont really need to check if we are followed in here, because
    // the link to this route only shows if you are followed,
    // and there is server side verification of following status when you
    //   submit the request

    // but there is the case where you have an ID, but the server is not 
    //   following you. Do we even want to support that scenario? Since
    //   this app is served from a certain domain, we could consider
    //   that domain to be the source of truth

    function createInv (ev) {
        ev.preventDefault()
        fetch()
    }

    return html`<div class="create-invitation-route">
        invite someone

        <form class="invitation" onSubmit=${createInv}>
            <button type="submit">create an invitation</button>
        </form>
    </div>`
}

module.exports = CreateInvitation
