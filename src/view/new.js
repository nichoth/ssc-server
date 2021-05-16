import { html } from 'htm/preact'
var ssc = require('@nichoth/ssc')

function New (props) {
    var { me } = props
    return html`<div class="route new-post">
        <${TestEl} me=${me} />
    </div>`
}

function TestEl (props) {
    var { me } = props
    return html`<form onsubmit="${submit.bind(null, me)}">
        <input type="text" placeholder="woooo" id="text" name="text" />
        <input type="file" name="image" id="image"
            accept="image/png, image/jpeg" />
        <button type="submit">submit</button>
    </form>`
}


function submit (me, ev) {
    ev.preventDefault()
    var fileList = ev.target.elements.image.files
    var file = fileList[0]

    const reader = new FileReader()

    reader.onloadend = () => {
        // var hash = createHash('sha256')
        // hash.update(reader.result)
        upload(me, reader.result/*, hash.digest('base64')*/)
    }

    // this gives us base64
    reader.readAsDataURL(file)
}

// This will upload the file after having read it
function upload (me, file, hash) {
    // console.log('the hash', hash)
    var keys = me

    // var slugifiedHash = ('' + hash).replace(/\//g, "-")
    // var slugifiedHash = encodeURIComponent('' + hash)
    var content = { type: 'test', text: 'wooooo' }

    fetch('/.netlify/functions/post-one-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            // hash: slugifiedHash,
            file: file, // This is your file object
            keys: me,

            // @TODO -- should use the existing msg as previous
            msg: ssc.createMsg(keys, null, content)
        })
    }).then(
        response => response.json() // if the response is a JSON object
    ).then(
        success => console.log('**succes**', success) // Handle the success response object
    ).catch(
        error => console.log('error', error) // Handle the error response object
    );
};

module.exports = New
