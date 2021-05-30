import { html } from 'htm/preact'

function Import (props) {
    console.log('props', props)
    return html`<div class="route whoami import">
        import view
    </div>`
}

module.exports = Import
