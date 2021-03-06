import { html } from 'htm/preact'
import { useState, useEffect } from 'preact/hooks';
const dragDrop = require('drag-drop')
var evs = require('../EVENTS')
const { Button } = require('@nichoth/forms/preact')

function NewPost (props) {
    return html`<div class="route new-post">
        <${FilePicker} ...${props} />
    </div>`
}

module.exports = NewPost

function FilePicker (props) {
    const [pendingImage, setPendingImage] = useState(null)
    const [isValid, setValid] = useState(false)
    const [isResolving, setResolving] = useState(false)
    const { me, feeds, client, emit, setRoute } = props
    const feed = feeds[me.did]

    // setup drag & drop
    useEffect(function didMount () {
        const cleanup = dragDrop('.file-inputs', (files, _, fileList) => {
            document.getElementById('image-input').files = fileList
            setPendingImage(files[0])
            // emit an 'input' event for form validation
            var event = new Event('input');
            document.getElementById('new-post-form').dispatchEvent(event);
        })

        return cleanup
    }, [])

    function formInput (ev) {
        checkIsValid()
    }

    function nevermind (ev) {
        ev.preventDefault()
        document.getElementById('image-input').value = ''
        document.getElementById('caption').value = ''
        checkIsValid()
        setPendingImage(null)
    }

    function checkIsValid () {
        var el = document.getElementById('new-post-form')
        var _isValid = el.checkValidity()
        if (_isValid !== isValid) setValid(_isValid)
    }

    function handleSubmit (ev) {
        ev.preventDefault()
        const file = ev.target.elements.image.files[0]
        const text = ev.target.elements.text.value

        const reader = new FileReader()

        setResolving(true)

        reader.onloadend = () => {
            const prev = feed.posts.length ?
                (feed.posts[0]).value :
                null

            client.createPost({
                files: [reader.result],
                content: { text },
                prev
            })
                .then(res => {
                    emit(evs.post.new, res)
                    setResolving(false)
                    setRoute('/post/' + encodeURIComponent(res.key))
                })
                .catch(err => {
                    // @TODO -- show error to user
                    console.log('err', err)
                })
        }

        // this gives us base64
        reader.readAsDataURL(file)
    }

    function chooseFile (ev) {
        var file = ev.target.files[0]
        setPendingImage(file)
    }

    const err = null
    const res = null

    return html`<form class="file-preview" id="new-post-form"
        oninput=${formInput} onsubmit="${handleSubmit}"
    >

        ${err ?
            html`<div class="error new-post-err">
                ${err.toString()}
            </div>` :
            null
        }

        <div class="file-inputs">
            ${pendingImage ?
                html`<div class="image-preview">
                    <img src=${URL.createObjectURL(pendingImage)} />
                </div>` :
                html`
                    <p>Drop pictures here</p>
                    <label for="image-input">Choose a picture</label>
                `
            }

            <input type="file" name="image" id="image-input" placeholder=" "
                accept="image/png,image/jpeg,image/jpg;capture=camera"
                onChange=${chooseFile}
                required=${true}
                capture="true"
            />
        </div>

        <label for="caption">caption</label>
        <textarea name="text" placeholder=" " id="caption"><//>

        <div class="controls">
            <${Button} isSpinning=${isResolving} type="submit"
                disabled=${!isValid}
            >
                Save
            <//>
            <${Button} onClick=${nevermind}>Nevermind<//>
        </div>

        ${res ?
            html`<div class="success">
                Success. You created a post
            </div>` :
            null
        }
    </form>`
}
