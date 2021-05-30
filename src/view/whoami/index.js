import { html } from 'htm/preact'
// import { useState } from 'preact/hooks';
// import 'preact/debug';
// var evs = require('../EVENTS')
// var Keys = require('../keys')
// var _getId = require('../get-id')
// var ssc = require('@nichoth/ssc')
// var xtend = require('xtend')
// var MY_URL = 'https://ssc-server.netlify.app'

function Whoami (props) {
    var { route } = props
    console.log('rrrrrroute', route)

    function isActive (href, path) {
        return href === path ? 'active' : ''
    }

    var splits = route.split('/')
    var endpoint = splits[splits.length - 1]

    return html`<div class="route whoami">
        <ul class="sub-nav">
            <li class=${isActive('/whoami/save', route)}>
                <a href="/whoami/save">save</a>
            </li>
            <li class="${isActive('/whoami/create', route)}">
                <a href="/whoami/create">create</a>
            </li>
            <li class="${isActive('/whoami/import', route)}">
                <a href="/whoami/import">import</a>
            </li>
        </ul>

        <div class="whoami tab ${endpoint}">
            ${props.children || html`<${Default} ...${props} />`}
        </div>
    </div>`
}

module.exports = Whoami

function Default (props) {
    var { me } = props

    return html`
        <h2>Who are you?</h2>

        <p>
            Source --
            ${me.source === null ?
                ' Not linked to an id server.' :
                html` Using <code>${me.source}</code> as an ID server.`
            }
        </p>

        <pre>${JSON.stringify(me, null, 2)}</pre>
    `
}
