import { html } from 'htm/preact'


function Hamburger (props) {
    return html`<div class="hamburger">
        <input id="hamburger-check" type="checkbox" />
        <label class="burger" for="hamburger-check">
            <div class="line top"></div>
            <div class="line bottom"></div>
        </label>
    </div>`
}

module.exports = Hamburger
