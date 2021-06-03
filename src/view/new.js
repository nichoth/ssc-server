import { html } from 'htm/preact'
import { useState, useEffect } from 'preact/hooks';
var ssc = require('@nichoth/ssc')
const dragDrop = require('drag-drop')

function New (props) {
    return html`<div class="route new-post">
        <${FilePicker} selectedFile=${null} ...${props} />
    </div>`
}

function FilePicker (props) {
    var [selectedFile, setSelectedFile] = useState(null)
    var [isValid, setValid] = useState(false)
    var { me, feed } = props

    useEffect(function didMount () {
        dragDrop('.file-inputs', (files, pos, fileList, directories) => {
            console.log('files', files)
            document.getElementById('image-input').files = fileList
            setSelectedFile(files[0])
            // emit a 'change' event for form validation
            var event = new Event('change');
            document.getElementById('new-post-form').dispatchEvent(event);
        })
    }, [])

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

    function formChange (ev) {
        var el = document.getElementById('new-post-form')
        var _isValid = el.checkValidity()
        if (_isValid !== isValid) setValid(_isValid)
    }

    function formInput (ev) {
        var el = document.getElementById('new-post-form')
        var _isValid = el.checkValidity()
        if (_isValid !== isValid) setValid(_isValid)
    }

    return html`<form class="file-preview" id="new-post-form"
        onchange=${formChange} oninput=${formInput}
        onsubmit="${submit.bind(null, me, feed)}"
    >
        <div class="file-inputs">
            ${selectedFile ?
                html`<div class="image-preview">
                    <img src=${URL.createObjectURL(selectedFile)} />
                </div>` :
                null
            }

            <label for="image-input">Choose a picture</label>
            <input type="file" name="image" id="image-input" placeholder=" "
                accept="image/png, image/jpeg" onChange=${chooseFile}
                required=${true}
            />
        </div>

        <label for="caption">caption</label>
        <textarea id="text" required=${true} name="text" placeholder=" "
            id="caption"
        ><//>

        <div class="controls">
            <button onClick=${nevermind}>Nevermind</button>
            <button type="submit" disabled=${!isValid}>Save</button>
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
