import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
// import 'preact/debug';
var URL = 'https://ssc-server.netlify.app'
var evs = require('../EVENTS')
var xtend = require('xtend')
var Keys = require('../keys')
var _getId = require('../get-id')
// var ssc = require('@nichoth/ssc')

function Whoami (props) {
    var { me, emit } = props
    const [isCreating, setCreating] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const [keyErr, setKeyErr] = useState(null);

    console.log('props', props)

    function getId (ev) {
        ev.preventDefault()
        var els = ev.target.elements
        console.log('name', els['login-name'].value)
        console.log('pword', els['password'].value)

        var name = els['login-name'].value
        var password = els['password'].value

        _getId({ name, password })
            .then(res => {
                console.log('id res', res)
                emit(evs.keys.got, { source: URL, secrets: res })
            })
            .catch(err => console.log('id errrrr', err))
    }

    function create (ev) {
        ev.preventDefault()
        setCreating(true)
    }

    function submitCreation (ev) {
        ev.preventDefault()
    }

    function cancel () {
        setCreating(false)
    }

    function createLocal (ev) {
        ev.preventDefault()
        var keys = Keys.create()
        console.log('create local id', keys)
        emit(evs.keys.got, { source: null, secrets: keys })
        setCreating(false)
    }

    // save the current (local) id to a server
    function startSaving (ev) {
        ev.preventDefault()
        console.log('save click')
        setSaving(true)
    }

    function saveId (ev) {
        ev.preventDefault()
        console.log('save the local id to a server')
    }

    function cancelSaveId (ev) {
        setSaving(false)
    }

    function setPasteForm (ev) {
        ev.preventDefault()
        var _keys = ev.target.elements['key-info'].value
        console.log('set paste form', _keys)
        try {
            var keys = JSON.parse(_keys)
        } catch (err) {
            setKeyErr(err)
        }
        // check the format of `keys`
        if (!keys.public || !keys.private || !keys.id || !keys.curve) {
            setKeyErr(new Error('Invalid key format'))
            return
        }
        emit(evs.keys.got, { source: null, secrets: keys })
    }

    // var idInfo = me ? xtend(me.secrets) : null
    // if (idInfo) idInfo.private = '~~~redacted~~~'
    // var source = me ? me.source : null

    if (isCreating) {
        return html`<div class="route whoami new">
            <${WhoAreYou} me=${me} />

            <div class="id-sources">
                <div class="id-source">
                    <h2>Create a local identity</h2>
                    <button onclick=${cancel}>cancel</button>
                    <button type="submit" onClick=${createLocal}>Create</button>
                </div>

                <div class="id-source">
                    <h2>Use <code>${URL}</code> as an ID server</h2>

                    <form class="creation-form" onsubmit=${submitCreation}
                        onreset=${cancel}
                    >
                        <div>
                            <label for="login-name">login name</label>
                            <input placeholder="name" name="login-name" id="login-name"
                                type="text" required />
                        </div>

                        <div>
                            <label for="password">password</label>
                            <input placeholder="password" name="password" id="password"
                                type="password" required />
                        </div>

                        <div>
                            <label for="verification">verify password</label>
                            <input type="password" placeholder="password"
                                name="verification" id="verification" required />
                        </div>

                        <button type="reset">cancel</button>
                        <button type="submit">submit</button>
                    </form>
                </div>
            </div>

        </div>`
    }

    return html`<div class="route whoami">
        <${WhoAreYou} me=${me} />

        <hr />

        <${NameYourself} me=${me} />

        <hr />

        <!-- if me.source is null, show this. lets you save the id to a
        server. null means the id is local -->
        ${(me && me.secrets && !me.source) ?
            html`<div>
                <h2>Save the current local ID to a server</h2>
                ${isSaving ?
                    html`<form onsubmit=${saveId} onreset=${cancelSaveId}>
                        <h2>Save this id to a server</h2>
                        <pre>${JSON.stringify(me, null, 2)}</pre>
                        <div class="form-group">
                            <label for="url">URL</label>
                            <input type="text" name="url" id="url" required />
                        </div>
                        <button type="reset">cancel</button>
                        <button type="submit">submit</button>
                    </form>` :
                    html`<form>
                        <button type="submit" onClick=${startSaving}>
                            save
                        </button>
                    </form>`
                }
            </div>` :
            null
        }

        ${!me.source ? html`<hr />` : null}

        <div>
            <h2>Create a new identity</h2>
            <p>Either locally or via an ID server</p>
            <button onclick=${create}>Create a new identity</button>
        </div>

        <hr />

        <!-- the login form -->
        <h2>Use an existing identity</h2>

        <div class="id-paste-form id-source">
            <h3>From a local source</h3>
            <p>This should be JSON containing your keys</p>
            <p>For example:</p>
            <pre>
                ${JSON.stringify({
                    "curve": "ed25519",
                    "public": "123",
                    "private": "abc",
                    "id": "@123"
                }, null, 2)}
            </pre>
            <form onsubmit=${setPasteForm}>
                <textarea name="key-info" id="key-info"></textarea>
                <button type="submit">set keys</button>
            </form>
        </div>

        <form class="whoami-form" onsubmit=${getId}>
            <div class="id-source">
                <h3>Use <code>${URL}</code> as an ID server</h3>

                ${!me.source ?
                    html`<p>This will get rid of your local ID</p>` :
                    null
                }

                <div>
                    <label for="login-name">name</label>
                    <input placeholder="name" name="login-name" id="login-name"
                        type="text" required />
                </div>

                <div>
                    <label for="password">password</label>
                    <input placeholder="password" name="password" id="password"
                        type="password" required />
                </div>

                <button type="submit">submit</button>
            </div>
        </form>
    </div>`
}

function NameYourself ({ me }) {
    var { userName } = me

    var [isNaming, setNaming] = useState(false)

    function nameYourself (ev) {
        ev.preventDefault()
        setNaming(true)
    }

    function cancelNaming (ev) {
        setNaming(false)
    }

    function setName (ev) {
        ev.preventDefault()
        var name = ev.target.elements['user-name'].value
        console.log('set name', name)
    }

    return html`<div class="name-yourself">
        ${isNaming ?
            html`<form onsubmit=${setName} onreset="${cancelNaming}">
                <div class="form-section">
                    <label for="user-name">user name </label>
                    <input type="text" name="user-name" id="user-name"
                        placeholder=${me.userName || 'Anonymous'}
                    />
                </div>
                <button type="reset">cancel</button>
                <button type="submit">save</button>
            </form>` :

            // pencil emoji
            html`<span class="user-name">
                <span class="current-name">${userName || 'Anonymous'}</span>
                <button class="edit-pencil" onClick=${nameYourself}
                    title="edit"
                >
                    ✏
                </button>
            </span>`
        }
    </div>`
}

function WhoAreYou ({ me }) {
    var { source } = me

    var idInfo = me ? xtend(me.secrets) : null
    if (idInfo) idInfo.private = '~~~redacted~~~'
    var source = me ? me.source : null

    return html`<h1>who are you?</h1>
        <p>source -- ${source || 'local'}</p>
        <pre>
            ${JSON.stringify(idInfo, null, 2)}
        </pre>`
}

module.exports = Whoami
