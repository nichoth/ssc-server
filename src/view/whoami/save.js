import { html } from 'htm/preact'

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

    return html`<form onsubmit=${saveId}>
        <h2>Save this id to a server</h2>
        <p>This will create a backup of your identity on
            <code> http://ssc-server.netlify.app/</code>
        </p>
        <pre>${JSON.stringify(me.secrets, null, 2)}</pre>
        <!-- <button type="reset">cancel</button> -->
        <button type="submit">save</button>
    </form>`
}

module.exports = Save
