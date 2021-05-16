var _router = require('ruta3')
var Home = require('./view/home')
var New = require('./view/new')
// import { html } from 'htm/preact'

function Router () {
    var router = _router()

    router.addRoute('/', () => {
        return { view: Home }
    })

    router.addRoute('/new', (match) => {
        return {
            view: New
        }
    })

    return router
}

module.exports = Router
