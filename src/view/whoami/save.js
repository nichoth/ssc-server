import { html } from 'htm/preact'

function Save (props) {
    console.log('props', props)
    return html`<div class="route whoami save">
        save view
    </div>`
}

module.exports = Save
