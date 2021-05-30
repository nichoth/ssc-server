import { html } from 'htm/preact'
var MY_URL = 'https://ssc-server.netlify.app'
var Keys = require('../../keys')

module.exports = Create

function Create (props) {
    // var { me } = props
    console.log('props create', props)

    function createLocalId (ev) {
        ev.preventDefault()
        var keys = Keys.create()
        console.log('create local id', keys)
        emit(evs.keys.got, { source: null, secrets: keys })
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
            <div class="id-source">
                <h2>Create a local identity</h2>
                <p>This will destroy your current ID</p>
                <button onclick=${reset}>cancel</button>
                <button type="submit" onClick=${createLocalId}>Create</button>
            </div>

            <div class="id-source">
                <h2>Use <code>${MY_URL}</code> as an ID server</h2>

                <p>Create a new ID using a server to store it.</p>

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
