import { html } from 'htm/preact'

function Shell (props) {
    return html`<div class="shell">
        <ul class="nav-part">
            <li><a href="/">home</a></li>
            <li><a href="/new">new</a></li>
        </ul>
        ${props.children}
    </div>`
}

module.exports = Shell
