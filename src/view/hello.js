import { html } from 'htm/preact'
// import { useEffect, useState } from 'preact/hooks';

function Hello (props) {
    // var { params } = props
    // var { key } = params

    console.log('hello props', props)

    return html`<div class="hello">
        <p>Hello</p>
        <p class="need-id">It looks like you don't have an identity.</p>
    </div>`
}

module.exports = Hello
