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

    var idInfo = me ? xtend(me.secrets) : null
    if (idInfo) idInfo.private = '~~~redacted~~~'
    var source = me ? me.source : null

    if (isCreating) {
        return html`<div class="route whoami new">
            <h1>who are you?</h1>
            <p>source -- ${source || 'local'}</p>
            <pre>
                ${JSON.stringify(idInfo, null, 2)}
            </pre>

            <h1>Create a new identity</h1>

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
        <h1>who are you?</h1>
        <pre>
            ${JSON.stringify(idInfo, null, 2)}
        </pre>

        <hr />

        <!-- if me.source is null, lets you save the id to a server
        b/c null means it is a local id -->
        ${(me && me.secrets && !me.source) ?
            html`<div>
                <h2>Save the current local ID to a server</h2>
                <form>
                    <button type="submit">save</button>
                </form>
            </div>` :
            null
        }

        ${!me.source ? html`<hr />` : null}

        <div>
            <h2>Create a new local identity</h2>
            <button onclick=${create}>Create a new identity</button>
        </div>

        <hr />

        <!-- the login form -->
        <form class="whoami-form" onsubmit=${getId}>
            <h2>Use an existing identity</h2>

            <div class="id-source">
                <h2>Use <code>${URL}</code> as an ID server</h2>

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

module.exports = Whoami