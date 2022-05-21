import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
// const ssc = require('@nichoth/ssc/web')
const { Button } = require('@nichoth/forms/preact')
const evs = require('../EVENTS')

// ssc.createMsg (keyStore, prevMsg, content)

// this will replace a single pinned message

function NewPin (props) {
    const { client, emit, pin, setRoute } = props
    console.log('*props*', props)

    const [isResolving, setResolving] = useState(false)

    function cancel (ev) {
        ev.preventDefault()
        setRoute('/')
    }

    function savePin (ev) {
        ev.preventDefault()
        const text = ev.target.elements['new-pin'].value
        if (text === pin) return console.log('same')
        setResolving(true)

        client.postPin(text).then(res => {
            setResolving(false)
            emit(evs.pin.post, res)
        }).catch(err => {
            setResolving(false)
            console.log('errrrr new pin', err)
        })
    }

    return html`<div class="route new-pin">
        <p>make a new pin</p>

        <p>
            This is some content that will always appear at the top of the
            homepage of this server.
        </p>

        <p>Whatever you save here will <em>replace</em> any existing message.</p>

        <form onsubmit=${savePin} onReset=${cancel}>
            <textarea required=${true} id="new-pin" name="new-pin"
                autofocus=${true}
            >
                ${props.pin}
            </textarea>

            <div class="form-controls">
                <${Button} type="submit" isSpinning=${isResolving}>
                    save
                </${Button}>

                <${Button} type="reset" disabled=${isResolving}
                    isSpinning=${false}
                >
                    cancel
                </${Button}>
            </div>
        </form>
    </div>`
}

module.exports = NewPin
