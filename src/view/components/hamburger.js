import { html } from 'htm/preact'


function Hamburger ({ onClick }) {

    return html`<div class="hamburger">
        <input type="checkbox" id="checkbox" />
        <label class="burger" for="checkbox" onclick=${onClick}>
            <button onclick=${onClick}>
                <div class="container top">
                    <div class="line top"></div>
                </div>
                <div class="container bottom">
                    <div class="line bottom"></div>
                </div>
            </button>
        </label>
    </div>`
}

module.exports = Hamburger
