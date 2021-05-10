import { html } from 'htm/preact'
import { render } from 'preact'

console.log('wooo')

// var createHash = require('multiblob/util').createHash


// This will upload the file after having read it
const upload = (file) => {
    fetch(' /.netlify/functions/upload-image', { // Your POST endpoint
        method: 'POST',
        headers: {
            // Content-Type may need to be completely **omitted**
            // or you may need something
            // "Content-Type": "You will perhaps need to define a content-type here"
        },
        body: file // This is your file object
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
        upload(reader.result)
        // logs a bunch
        // console.log('reader res', reader.result)
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
