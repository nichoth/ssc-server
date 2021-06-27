var _router = require('ruta3')
var Home = require('./view/home')
var New = require('./view/new')
var Whoami = require('./view/whoami')
var SingleImage = require('./view/single-image')
var createProfileView = require('./view/profile')

var tabs = {
    save: require('./view/whoami/save'),
    create: require('./view/whoami/create'),
    import: require('./view/whoami/import')
}

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

    router.addRoute('/whoami/:subroute', match => {
        var { params } = match
        var { subroute } = params
        var subView = tabs[subroute]

        return {
            view: Whoami,
            subView: subView
        }
    })

    router.addRoute('/post/:key', match => {
        // var { key } = match.params

        return {
            view: SingleImage
        }
    })

    router.addRoute('/:username', match => {
        var { username } = match.params
        return {
            view: createProfileView(username)
        }
    })

    return router
}

module.exports = Router
