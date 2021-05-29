var _router = require('ruta3')
var Home = require('./view/home')
var New = require('./view/new')
var Whoami = require('./view/whoami')
var SingleImage = require('./view/single-image')

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

    router.addRoute('/whoami', match => {
        return {
            view: Whoami
        }
    })

    router.addRoute('/:key', match => {
        // var { key } = match.params

        return {
            view: SingleImage
        }
    })

    return router
}

module.exports = Router
