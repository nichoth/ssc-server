import { html } from 'htm/preact'
import { useState } from 'preact/hooks';

function CopyButton ({ copyText }) {
    const [hasCopied, setHasCopied] = useState(false)

    function copyTextFn (ev) {
        ev.preventDefault()
        navigator.clipboard.writeText(copyText)
        setHasCopied(true)
    }

    return html`
        <div class="copy-button">
            <button class="icon" onclick=${copyTextFn}>
                <img class="copy-icon" src="/copy-solid.svg" title="copy" />
            </button>

            ${hasCopied ?
                html`<span class="has-copied">copied!</span>` :
                null
            }
        </div>
    `
}

module.exports = CopyButton
