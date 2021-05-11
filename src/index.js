import { html } from 'htm/preact'
import { render } from 'preact'
var ssc = require('@nichoth/ssc')
var createHash = require('crypto').createHash

var keys = ssc.createKeys()

// var S = require('pull-stream')
// var fileReader = require('pull-file-reader')

console.log('wooo')

// This will upload the file after having read it
const upload = (file, hash) => {
    console.log('the hash', hash)

    var slugifiedHash = ('' + hash).replace(/\//g, "-")
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

function submit (ev) {
    ev.preventDefault()
    var fileList = ev.target.elements.image.files
    var file = fileList[0]
    console.log('file', file)

    const reader = new FileReader()

    reader.onloadend = () => {
        var hash = createHash('sha256')
        hash.update(reader.result)
        upload(reader.result, hash.digest('base64'))
    }

    reader.readAsDataURL(file)
}

function TestEl (props) {
    return html`<form onsubmit="${submit}">
        <input type="text" placeholder="woooo" id="text" name="text" />
        <input type="file" name="image" id="image"
            accept="image/png, image/jpeg" />
        <button type="submit">submit</button>
    </form>`
}

render(html`<${TestEl} />`, document.getElementById('content'))
