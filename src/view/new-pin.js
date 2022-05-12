import { html } from 'htm/preact'
import { useState, useEffect } from 'preact/hooks';
const ssc = require('@nichoth/ssc/web')
var { Button } = require('@nichoth/forms/preact')

// ssc.createMsg (keyStore, prevMsg, content)

// this will replace a single pinned message

function NewPin (props) {
    const { me, client } = props
    console.log('*props*', props)

    const [isResolving, setResolving] = useState(false)

    useEffect(function didMount () {
        // in here, get the existing pinned post if we don't have it already
    }, [])

    function savePin (ev) {
        ev.preventDefault()
        const text = ev.target.elements['new-pin'].value
        console.log('save pin', text)
        setResolving(true)
        client.postPin('this is a **test message**').then(res => {
            setResolving(false)
            console.log('*pin response*', res)
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

        <form onsubmit=${savePin}>
            <textarea required=${true} id="new-pin" name="new-pin"
                autofocus=${true}
            ></textarea>

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
