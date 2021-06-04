import { html } from 'htm/preact'
var c = require('../../constants')

function Save (props) {
    console.log('props', props)
    var { me } = props

    function saveId (ev) {
        ev.preventDefault()
        console.log('save the local id to a server')
        var els = ev.target.elements
        console.log('els', els)
        console.log(els.url)
    }

    return (me && me.secrets ?
        html`<form onsubmit=${saveId}>
            <h2>Save this id to a server</h2>
            <p>This will create a backup of your identity on
                <code> ${c.url}</code>
            </p>
            <pre>${JSON.stringify(me.secrets, null, 2)}</pre>
            <!-- <button type="reset">cancel</button> -->
            <button type="submit">save</button>
        </form>` :
        html`<p>It looks like you need to <a href="/whoami/create">
            create an ID
        </a> first.</p>`
    )
}

module.exports = Save
