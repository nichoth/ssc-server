import { html } from 'htm/preact'

function Create (props) {
    console.log('props', props)
    return html`<div class="route whoami create">
        create something
    </div>`
}

module.exports = Create
