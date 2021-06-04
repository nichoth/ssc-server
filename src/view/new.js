import { html } from 'htm/preact'
import { useState, useEffect } from 'preact/hooks';
var evs = require('../EVENTS')
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
    var [err, setErr] = useState(null)
    var [res, setRes] = useState(null)
    var { me, feed, emit } = props

    console.log('props', props)

    useEffect(function didMount () {
        fetch('/.netlify/functions/feed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                author: '@' + me.secrets.public
            })
        })
            .then(res => {
                console.log('res', res)
                return res.json()
            })
            .then(json => {
                console.log('json', json)
                // setFeed(json.msgs)
                var msgs = json.msgs
                // msgs.reverse()
                emit(evs.feed.got, msgs)
            })
            .catch(err => {
                console.log('errrr in home', err)
            })
    }, [])

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

    function formChange () {
        checkIsValid()
    }

    function formInput () {
        checkIsValid()
    }

    function checkIsValid () {
        var el = document.getElementById('new-post-form')
        var _isValid = el.checkValidity()
        if (_isValid !== isValid) setValid(_isValid)
    }

    return html`<form class="file-preview" id="new-post-form"
        onchange=${formChange} oninput=${formInput}
        onsubmit="${submit.bind(null, me, feed, setErr, setRes)}"
    >

        ${err ?
            html`<div class="error new-post-err">
                ${err.toString()}
            </div>` :
            null
        }

        <div class="file-inputs">
            ${selectedFile ?
                html`<div class="image-preview">
                    <img src=${URL.createObjectURL(selectedFile)} />
                </div>` :
                null
            }

            ${!selectedFile ?
                html`
                    <p>Drop pictures here</p>
                    <label for="image-input">Choose a picture</label>
                ` :
                null
            }
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

        ${res ?
            html`<div class="success">
                Success. You created a post
            </div>` :
            null
        }

    </form>`
}

function submit (me, feed, setErr, setRes, ev) {
    ev.preventDefault()
    var fileList = ev.target.elements.image.files
    var file = fileList[0]
    var text = ev.target.elements.text.value

    console.log('text***', text)

    const reader = new FileReader()

    reader.onloadend = () => {
        upload(me, reader.result, text, feed)
            .then(res => {
                console.log('**success**', res)
                setRes(res)
            })
            .catch(err => {
                console.log('errrrrrrr', err)
                setErr(err)
            });
    }

    // this gives us base64
    reader.readAsDataURL(file)
}

// This will upload the file after having read it
function upload (me, file, text, feed) {
    var keys = me.secrets
    var content = { type: 'test', text: text }

    console.log('feed', feed)

    // the feed is in reverse order
    var prev = feed ? feed[0] : null
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

    return fetch('/.netlify/functions/post-one-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            file: file, // This is your file object
            keys: keys,
            msg: ssc.createMsg(keys, prev || null, content)
        })
    }).then(response => response.json())
};

module.exports = New

function clone (obj) {
    var _obj = {};
    for (var k in obj) {
      if (Object.hasOwnProperty.call(obj, k)) _obj[k] = obj[k];
    }
    return _obj;
}
