import { html } from 'htm/preact'
// import { useEffect, useState } from 'preact/hooks';

function CreateInvitation (props) {
    // var { params } = props
    // var { key } = params

    console.log('create invitation props', props)

    return html`<div class="create-invitation-route">
        create an invitation
    </div>`
}

module.exports = CreateInvitation

