import { html } from 'htm/preact'
import { useState } from 'preact/hooks';

function Shell (props) {
    var { path, profile } = props
    var [isNaming, setNaming] = useState(false)

    function active (href) {
        var baseHref = href.split('/')[1]
        var basePath = path.split('/')[1]
        return baseHref === basePath ? 'active' : ''
    }

    function _nameYourself (ev) {
        ev.preventDefault()
        setNaming(true)
    }

    function NameEditor (props) {
        var { profile } = props
        return html`<form>
            <input placeholder="${getName(profile)}" />
        </form>`
    }

    return html`<div class="shell">
        <ul class="nav-part">
            <li class="name">
                ${isNaming ?
                    (html`<${NameEditor} ...${props} />`) :
                    html`
                        <h1>${getName(profile)}</h1>
                        <!-- pencil emoji -->
                        <button class="edit-pencil" onClick=${_nameYourself}
                            title="edit"
                        >
                            ✏
                        </button>
                    `
                }
            </li>
            <li class="${active('/')}"><a href="/">home</a></li>
            <li class="${active('/new')}"><a href="/new">new</a></li>
            <li class="${active('/whoami')}"><a href="/whoami">whoami</a></li>
        </ul>

        <hr />

        ${props.children}
    </div>`
}


function getName (profile) {
    return (profile && profile.userName) || 'Anonymous'
}


module.exports = Shell
