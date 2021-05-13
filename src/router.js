var _router = require('ruta3')
var Home = require('./view/home')
import { html } from 'htm/preact'

function Router () {
    var router = _router()

    router.addRoute('/', () => {
        return { view: Home }
    })

    router.addRoute('/new', (match) => {
        return {
            view: function newPostRoute (props) {
                return html`<div class="route new-post">
                    <${TestEl} />
                </div>`
            }
        }
    })

    return router
}



function TestEl (props) {
    return html`<form onsubmit="${submit}">
        <input type="text" placeholder="woooo" id="text" name="text" />
        <input type="file" name="image" id="image"
            accept="image/png, image/jpeg" />
        <button type="submit">submit</button>
    </form>`
}

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

    // this gives us base64
    reader.readAsDataURL(file)
}



module.exports = Router
