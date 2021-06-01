import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
var ssc = require('@nichoth/ssc')

function New (props) {
    var { me, feed } = props
    return html`<div class="route new-post">
        <${FilePicker} selectedFile=${null} />
    </div>`
}

function FilePicker (props) {
    var [selectedFile, setSelectedFile] = useState(null)
    var { me, feed } = props

    function chooseFile (ev) {
        var file = ev.target.files[0]
        console.log('****file****', file)
        setSelectedFile(file)
    }

    function nevermind (ev) {
        ev.preventDefault()
        document.getElementById('image-input').value = ''
        setSelectedFile(null)
    }

    return html`<form class="file-preview"
        onsubmit="${submit.bind(null, me, feed)}"
    >
        ${selectedFile ?
            html`<div class="image-preview">
                <img src=${URL.createObjectURL(selectedFile)} />
            </div>` :
            null
        }

        <div class="file-inputs">
            <input type="file" name="image" id="image-input"
                accept="image/png, image/jpeg" onChange=${chooseFile}
                required=${true}
            />
        </div>

        <textarea id="text" required=${true} name="text"><//>

        <div class="controls">
            <button onClick=${nevermind}>Nevermind</button>
            <button type="submit">Save</button>
        </div>
    </form>`
}

function submit (me, feed, ev) {
    ev.preventDefault()
    var fileList = ev.target.elements.image.files
    var file = fileList[0]
    var text = ev.target.elements.text.value

    console.log('text***', text)

    const reader = new FileReader()

    reader.onloadend = () => {
        upload(me, reader.result, text, feed)
    }

    // this gives us base64
    reader.readAsDataURL(file)
}

// This will upload the file after having read it
function upload (me, file, text, feed) {
    var keys = me.secrets
    var content = { type: 'test', text: text }

    var prev = feed ? feed[feed.length - 1] : null
    if (prev) {
        prev = clone(prev.value)
    }

    console.log('**prev**', prev)
    if (prev) {
        console.log('**prev id**', ssc.getId(prev))
    }

    console.log('**next**', {
        keys: me.secrets,
        msg: ssc.createMsg(keys, prev || null, content)
    })

    fetch('/.netlify/functions/post-one-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            file: file, // This is your file object
            keys: keys,
            msg: ssc.createMsg(keys, prev || null, content)
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

function clone (obj) {
    var _obj = {};
    for (var k in obj) {
      if (Object.hasOwnProperty.call(obj, k)) _obj[k] = obj[k];
    }
    return _obj;
}
