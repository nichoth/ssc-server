import { html } from 'htm/preact'

function Save (props) {
    console.log('props', props)
    var { me } = props

    function saveId (ev) {
        ev.preventDefault()
        console.log('save the local id to a server')
        var els = ev.target.elements
        console.log('els', els)
    }

    return html`<form onsubmit=${saveId}>
        <h2>Save this id to a server</h2>
        <p>This will create a backup of you identity on the given server</p>
        <pre>${JSON.stringify(me.secrets, null, 2)}</pre>
        <div class="form-group">
            <label for="url">URL</label>
            <input type="text" name="url" id="url" required />
        </div>
        <button type="reset">cancel</button>
        <button type="submit">submit</button>
    </form>`
}

module.exports = Save
