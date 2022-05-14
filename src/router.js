var _router = require('ruta3')
var Home = require('./view/home')
var New = require('./view/new')
var Whoami = require('./view/whoami')
var SingleImage = require('./view/single-image')
var createProfileView = require('./view/profile')
var CreateInvitation = require('./view/create-invitation')
var RedeemInvitation = require('./view/redeem-invitation')
var Hello = require('./view/hello')
const NewPin = require('./view/new-pin')

// var tabs = {
//     save: require('./view/whoami/save'),
//     create: require('./view/whoami/create'),
//     import: require('./view/whoami/import')
// }

function Router () {
    var router = _router()

    router.addRoute('/', () => {
        return { view: Home, getContent: newPinContent }
    })

    router.addRoute('/hello', () => {
        return { view: Hello }
    })

    // router.addRoute('/new', (match) => {
    //     return {
    //         view: New
    //     }
    // })

    router.addRoute('/whoami', match => {
        return { view: Whoami }
    })

    router.addRoute('/new-pin', match => {
        return { view: NewPin, getContent: newPinContent }
    })

    function newPinContent (state, client) {
        if (!state.pin()) {
            client.getPin().then(pin => {
                console.log('got pin in router', pin)
                state.pin.set(pin.value.content.text)
            })
        }
    }

    // // router.addRoute('/whoami/:subroute', match => {
    // //     var { params } = match
    // //     var { subroute } = params
    // //     var subView = tabs[subroute]

    // //     return {
    // //         view: Whoami,
    // //         subView: subView
    // //     }
    // // })

    // router.addRoute('/post/:key', match => {
    //     return {
    //         view: SingleImage
    //     }
    // })

    // router.addRoute('/create-invitation', () => {
    //     return {
    //         view: CreateInvitation
    //     }
    // })

    // router.addRoute('/invitation*', (match) => {
    //     var { splats } = match
    //     var qs = splats[0]
    //     const urlSearchParams = new URLSearchParams(qs)
    //     const params = Object.fromEntries(urlSearchParams.entries())
    //     var { code } = params

    //     console.log('params', params)

    //     return {
    //         view: RedeemInvitation(code)
    //     }
    // })

    // router.addRoute('/hello', () => {
    //     return {
    //         view: Hello
    //     }
    // })

    // router.addRoute('/:username', match => {
    //     var { username } = match.params
    //     return {
    //         view: createProfileView(username)
    //     }
    // })

    return router
}

module.exports = Router
