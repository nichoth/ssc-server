import { html } from 'htm/preact'

function Shell (props) {
    var { path, profile } = props

    function active (href) {
        var baseHref = href.split('/')[1]
        var basePath = path.split('/')[1]
        return baseHref === basePath ? 'active' : ''
    }

    return html`<div class="shell">
        <ul class="nav-part">
            <li class="name">
                <h1>${(profile && profile.userName) || 'Anonymous'}</h1>
            </li>
            <li class="${active('/')}"><a href="/">home</a></li>
            <li class="${active('/new')}"><a href="/new">new</a></li>
            <li class="${active('/whoami')}"><a href="/whoami">whoami</a></li>
        </ul>

        <hr />

        ${props.children}
    </div>`
}

module.exports = Shell
