import { html } from 'htm/preact'
import { useState, useEffect } from 'preact/hooks';
const ssc = require('@nichoth/ssc/web')
var { Button } = require('@nichoth/forms/preact')

// ssc.createMsg (keyStore, prevMsg, content)

// this will replace a single pinned message


function NewPin (props) {
    const { me } = props

    const [isResolving, setResolving] = useState(false)

    useEffect(function didMount () {
        // in here, get the existing pinned post
    }, [])

    function savePin (ev) {
        ev.preventDefault()
        const text = ev.target.elements['new-pin'].value
        console.log('save pin', text)
        setResolving(true)
        setTimeout(() => {
            setResolving(false)
        }, 1000)
    }

    return html`<div class="route new-pin">
        <p>make a new pin</p>

        <form onsubmit=${savePin}>
            <textarea id="new-pin" name="new-pin" autofocus=${true}></textarea>

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
