import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
var evs = require('../EVENTS')
var ssc = require('@nichoth/ssc')


function Shell (props) {
    var { path, profile, emit } = props
    var [isNaming, setNaming] = useState(false)
    var [isResolving, setResolving] = useState(false)

    async function saveName (me, ev) {
        ev.preventDefault()
        var name = ev.target.elements['user-name'].value
        console.log('set name in here', name)

        var msgContent = {
            type: 'about',
            about: me.secrets.id,
            name: name
        }

        // should make the API call in here
        // and emit an event when you get a response

        setResolving(true)

        var keys = me.secrets
        var qs = new URLSearchParams({ author: me.secrets.id }).toString();
        console.log('meeeee', me)
        console.log('qsssss', qs)
        var url = '/.netlify/functions/abouts' + '?' + qs

        try {
            var _prev = await fetch(url).then(res => res.json())
            console.log('prevvvvv', _prev.msg)
        } catch (err) {
            console.log('about fetch errr', err)
        }

        console.log('prevvviousss', _prev)
        var prev = _prev && _prev.msg && _prev.msg.value || null
        console.log('goood prevvvv', prev)
        var msg = ssc.createMsg(keys, prev || null, msgContent)

        fetch('/.netlify/functions/set-name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                keys: { public: me.secrets.public },
                msg: msg
            })
        })
            .then(res => res.json())
            .then(res => {
                console.log('**set name res**', res)
                setResolving(false)
                setNaming(false)
                emit(evs.identity.setName, res.value.content.name)
            })
            .catch(err => {
                setResolving(false)
                console.log('errrrr', err)
            })
    }

    function active (href) {
        var baseHref = href.split('/')[1]
        var basePath = path.split('/')[1]
        return baseHref === basePath ? 'active' : ''
    }

    function _nameYourself (ev) {
        ev.preventDefault()
        setNaming(true)
    }

    function stopNamingYourself (ev) {
        ev.preventDefault()
        setNaming(false)
    }

    function NameEditor (props) {
        var { me, profile } = props

        return html`<form onreset=${stopNamingYourself}
            onsubmit=${saveName.bind(null, me)}
            class=${'name-editor' + (isResolving ? ' resolving' : '')}
        >
            <input name="user-name" id="user-name"
                placeholder="${getName(profile)}"
            />
            <button type="reset">cancel</button>
            <button type="submit">save</button>
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
