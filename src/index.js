import { html } from 'htm/preact'
import { render } from 'preact'
var ssc = require('@nichoth/ssc')
// var createHash = require('crypto').createHash
var route = require('route-event')()
var router = require('./router')()

route(function onRoute (path) {
    console.log('path', path)
    var m = router.match(path)
    var { view } = m.action(m)

    render(html`<${Shell}><${view} /><//>`,
        document.getElementById('content'))
})

var keys = ssc.createKeys()

// var S = require('pull-stream')
// var fileReader = require('pull-file-reader')

console.log('wooo')

// This will upload the file after having read it
const upload = (file, hash) => {
    console.log('the hash', hash)

    // var slugifiedHash = ('' + hash).replace(/\//g, "-")
    var slugifiedHash = encodeURIComponent('' + hash)
    var content = { type: 'test', text: 'wooooo' }

    fetch('/.netlify/functions/post-one-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            hash: slugifiedHash,
            file: file, // This is your file object
            keys: {
                public: keys.public
            },
            msg: ssc.createMsg(keys, null, content)
        })
    }).then(
        response => response.json() // if the response is a JSON object
    ).then(
        success => console.log('succes', success) // Handle the success response object
    ).catch(
        error => console.log('error', error) // Handle the error response object
    );
};

function Shell (props) {
    return html`<div class="shell">
        <ul class="nav-part">
            <li><a href="/">home</a></li>
            <li><a href="/new">new</a></li>
        </ul>
        ${props.children}
    </div>`
}

