import { html } from 'htm/preact'

function Shell (props) {
    var { path } = props

    function active (href) {
        return href === path ? 'active' : ''
    }

    return html`<div class="shell">
        <ul class="nav-part">
            <li class="${active('/')}"><a href="/">home</a></li>
            <li class="${active('/new')}"><a href="/new">new</a></li>
        </ul>

        <hr />

        ${props.children}
    </div>`
}

module.exports = Shell
