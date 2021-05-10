import { html } from 'htm/preact'
import { render } from 'preact'

var S = require('pull-stream')
var fileReader = require('pull-file-reader')

var createHash = require('multiblob/util').createHash

console.log('wooo')

// var createHash = require('multiblob/util').createHash


// This will upload the file after having read it
const upload = (file, hash) => {
    fetch(' /.netlify/functions/upload-image', { // Your POST endpoint
        method: 'POST',
        headers: {
            // Content-Type may need to be completely **omitted**
            // or you may need something
            // "Content-Type": "You will perhaps need to define a content-type here"
        },
        body: JSON.stringify({
            hash: hash,
            file: file // This is your file object
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
    var hasher = createHash('sha256')
    console.log('file', file)

    S(
        fileReader(file),
        hasher,
        S.collect(function (err, buffs)  {
            console.log('collected', err, buffs)
            var contents = Buffer.concat(buffs)
            console.log('contents', contents)
            var hash = '&' + hasher.digest

            const reader = new FileReader()

            reader.onloadend = () => {
                upload(reader.result, hash)
                // logs a bunch
                // console.log('reader res', reader.result)
            }

            // this is bad because we are reading the file *twice*
            // the first time is b/c we need to get a hash for it
            reader.readAsDataURL(file)
            // upload(contents)
        })
    )

    // ---------------------------------------

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
