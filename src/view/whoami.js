import { html } from 'htm/preact'
var url = 'https://ssc-server.netlify.app'
// var ssc = require('@nichoth/ssc')

function Whoami (props) {
    var { me, emit } = props

    console.log('props', props)

    function submit (ev) {
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
    }

    return html`<div class="route whoami">
        <form class="whoami-form" onsubmit=${submit}>
            <p><code>Use ${url} as an ID server</code></p>

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
