import { html } from 'htm/preact'
var ssc = require('@nichoth/ssc')

function New (props) {
    var { me, feed } = props
    return html`<div class="route new-post">
        <${TestEl} me=${me} feed=${feed} />
    </div>`
}

function TestEl (props) {
    var { me, feed } = props
    return html`<form onsubmit="${submit.bind(null, me, feed)}">
        <input type="text" placeholder="woooo" id="text" name="text" />
        <input type="file" name="image" id="image"
            accept="image/png, image/jpeg" />
        <button type="submit">submit</button>
    </form>`
}


function submit (me, feed, ev) {
    ev.preventDefault()
    var fileList = ev.target.elements.image.files
    var file = fileList[0]

    const reader = new FileReader()

    reader.onloadend = () => {
        upload(me, reader.result, feed)
    }

    // this gives us base64
    reader.readAsDataURL(file)
}

// This will upload the file after having read it
function upload (me, file, feed) {
    // console.log('the hash', hash)
    var keys = me

    var content = { type: 'test', text: 'wooooo' }

    var prev
    var _prev = feed[feed.length - 1]
    if (_prev) {
        prev = clone(_prev)
        delete prev.content.mentionUrls
    }

    fetch('/.netlify/functions/post-one-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            file: file, // This is your file object
            keys: me,

            // @TODO -- should use the existing msg as previous
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
