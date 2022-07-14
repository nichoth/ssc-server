import { html } from 'htm/preact'
var MY_URL = 'https://ssc-server.netlify.app'
var Keys = require('../../keys')
var evs = require('../../EVENTS')

module.exports = Create

function Create (props) {
    var { emit, setRoute } = props

    const keys = Keys(window.keystore)

    function createLocalId (ev) {
        ev.preventDefault()
        var ks = keys.create()
        console.log('create local id', ks)
        emit(evs.keys.got, { source: null, secrets: ks })

        // set this here for the cypress tests
        if (process.env.NODE_ENV === 'test') {
            window.myKeys = ks
        }

        setRoute('/invitation')
    }

    function submitCreationToServer (ev) {
        ev.preventDefault()
        console.log('submit creation', ev.target.elements)
    }

    function reset () {
        console.log('reset everything')
    }

    return html`<div class="route whoami create">

        <div class="id-sources">
            <div class="id-source create-id">
                <h2>Create a local identity</h2>
                ${(props.me.secrets && props.me.secrets.id) ?
                    html`<p>This will destroy your current ID</p>` :
                    null
                } 
                <button type="submit" onClick=${createLocalId}>Create</button>
            </div>

            <div class="id-source">
                <h2>Use <code>${MY_URL}</code> as an ID server</h2>

                <p>Create a new ID record on the server,
                    then use the ID in this client.
                    To use an existing ID record, see 'import' above^</p>

                <form class="creation-form" onsubmit=${submitCreationToServer}
                    onreset=${reset}
                >
                    <div class="form-group">
                        <label for="login-name">login name</label>
                        <input placeholder="name" name="login-name"
                            id="login-name" type="text" required />
                    </div>

                    <div class="form-group">
                        <label for="password">password</label>
                        <input placeholder="password" name="password" id="password"
                            type="password" required />
                    </div>

                    <div class="form-group">
                        <label for="verification">verify password</label>
                        <input type="password" placeholder="password"
                            name="verification" id="verification" required />
                    </div>

                    <button type="reset">reset</button>
                    <button type="submit">submit</button>
                </form>
            </div>
        </div>

    </div>`
}
