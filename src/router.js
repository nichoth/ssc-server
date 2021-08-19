var _router = require('ruta3')
var Home = require('./view/home')
var New = require('./view/new')
var Whoami = require('./view/whoami')
var SingleImage = require('./view/single-image')
var createProfileView = require('./view/profile')
var CreateInvitation = require('./view/create-invitation')
var RedeemInvitation = require('./view/redeem-invitation')
var Hello = require('./view/hello.js')

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
        return {
            view: SingleImage
        }
    })

    router.addRoute('/create-invitation', () => {
        return {
            view : CreateInvitation
        }
    })

    router.addRoute('/invitation', () => {
        return {
            view: RedeemInvitation
        }
    })

    router.addRoute('/hello', () => {
        return { view: Hello }
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
