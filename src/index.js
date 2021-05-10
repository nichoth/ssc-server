import { html } from 'htm/preact'
import { render } from 'preact'
var createHash = require('crypto').createHash

// var S = require('pull-stream')
// var fileReader = require('pull-file-reader')

// var createHash = require('multiblob/util').createHash

console.log('wooo')


// This will upload the file after having read it
const upload = (file, hash) => {
    console.log('the hash', hash)

    console.log('slugified', ('' + hash).replace(/\//g, "-"))

    fetch(' /.netlify/functions/upload-image', { // Your POST endpoint
        method: 'POST',
        headers: {
            // Content-Type may need to be completely **omitted**
            // or you may need something
            // "Content-Type": "You will perhaps need to define a content-type here"
        },
        body: JSON.stringify({
            hash: ('' + hash).replace(/\//g, "-"),
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
    // var hasher = createHash('sha256')
    console.log('file', file)

    const reader = new FileReader()

    reader.onloadend = () => {
        var hash = createHash('sha256')
        hash.update(reader.result)
        upload(reader.result, hash.digest('base64'))
    }

    // this is bad because we are reading the file *twice*
    // the first time is b/c we need to get a hash for it
    reader.readAsDataURL(file)


    // S(
    //     fileReader(file),
    //     hasher,
    //     S.collect(function (err, buffs)  {
    //         console.log('collected', err, buffs)
    //         var contents = Buffer.concat(buffs)
    //         console.log('contents', contents)
    //         var hash = '&' + hasher.digest

    //         // var hash = algs[alg]()
    //         // var hash = createHash('sha256')
    //         // hash.digest()
               // upload(contents)

    //     })
    // )

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
