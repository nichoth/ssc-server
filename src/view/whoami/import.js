import { html } from 'htm/preact'
var _getId = require('../../get-id')
var MY_URL = 'https://ssc-server.netlify.app'
var evs = require('../../EVENTS')

function Import (props) {
    console.log('props', props)
    var { me, emit } = props

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
                emit(evs.keys.got, { source: MY_URL, secrets: res })
            })
            .catch(err => console.log('id errrrr', err))
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

    return html`<div class="route whoami import">

        <h2>Import an ID</h2>

        <div class="id-sources">

            <form class="whoami-form" onsubmit=${getId}>
                <div class="id-source">
                    <h3>Use <code>${MY_URL}</code> as an ID server</h3>

                    ${!me.source ?
                        html`<p>This will get rid of your local ID</p>` :
                        null
                    }

                    <div class="form-group">
                        <label for="login-name">name</label>
                        <input placeholder="name" name="login-name" id="login-name"
                            type="text" required />
                    </div>

                    <div class="form-group">
                        <label for="password">password</label>
                        <input placeholder="password" name="password" id="password"
                            type="password" required />
                    </div>

                    <button type="submit">import</button>
                </div>
            </form>


            <div class="id-paste-form id-source local-source">
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



        </div>



    </div>`
}

module.exports = Import
