import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
// import 'preact/debug';
var url = 'https://ssc-server.netlify.app'
var evs = require('../EVENTS')
var xtend = require('xtend')
// var ssc = require('@nichoth/ssc')

function Whoami (props) {
    var { me, emit } = props
    const [isCreating, setCreating] = useState(false);

    console.log('props', props)

    function getId (ev) {
        ev.preventDefault()
        var els = ev.target.elements
        // console.log('ev', ev)
        // console.log('els', els)
        console.log('name', els['login-name'].value)
        console.log('pword', els['password'].value)

        var name = els['login-name'].value
        var password = els['password'].value

        fetch('/.netlify/functions/id', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                loginName: name,
                password: password
            })
        })
            .then(res => res.json())
            .then(res => {
                console.log('id res', res)
                emit(evs.id.got, res)
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

    if (isCreating) {
        return html`<div class="route whoami new">
            <h1>Create a new identity</h1>

            <div class="id-source">
                <h2>Use <code>${url}</code> as an ID server</h2>

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

        </div>`
    }

    var idInfo = xtend(me.secrets)
    idInfo.private = '~~~ redacted ~~~'

    return html`<div class="route whoami">
        <p>who are you?</p>
        <pre>
            ${JSON.stringify(idInfo, null, 2)}
        </pre>

        <div>
            <button onclick=${create}>Create a new identity</button>
        </div>

        <!-- the login form -->
        <form class="whoami-form" onsubmit=${getId}>
            <p>Use <code>${url}</code> as an ID server</p>

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
        </form>
    </div>`
}

module.exports = Whoami
