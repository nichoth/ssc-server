import { html } from 'htm/preact'

function Default (props) {
    console.log('props', props)
    return html`<div class="route whoami default">
        default view
    </div>`
}

module.exports = Default

