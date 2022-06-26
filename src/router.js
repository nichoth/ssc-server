var _router = require('ruta3')
const Home = require('./view/home')
const New = require('./view/new')
const Whoami = require('./view/whoami')
var CreateInvitation = require('./view/create-invitation')
var Hello = require('./view/hello')
const NewPin = require('./view/new-pin')
const PostView = require('./view/post')
const ProfileView = require('./view/profile')
var router = _router()


function Router () {
    router.addRoute('/', () => {
        return { view: Home, getContent: newPinContent }
    })

    // view a user's feed/profile
    // at a route like /<did-here>
    router.addRoute('/did\:key\:*', (match) => {
        // console.log('user id*****', 'did:key:' + match.splats[0])
        return { view: ProfileView }
    })

    router.addRoute('/hello', () => {
        return { view: Hello }
    })

    router.addRoute('/new', (match) => {
        return {
            view: New
        }
    })

    router.addRoute('/whoami', match => {
        return { view: Whoami }
    })

    router.addRoute('/new-pin', match => {
        return { view: NewPin, getContent: newPinContent }
    })

    function newPinContent (state, client) {
        if (!state.pin()) {
            client.getPin().then(pin => {
                console.log('got new pin content', pin)
                state.pin.set(pin.value.content.text)
            })
        }
    }

    router.addRoute('/create-invitation', () => {
        return {
            view: CreateInvitation
        }
    })

    router.addRoute('/post/:key', (match) => {
        // const { key } = match.params
        return {
            // getContent: function (state) {
            //     const post = state.singlePost()
            //     if (!post || (post.key !== key)) {
            //         console.log('getting content', state())
            //         console.log('**************get that blub')

            //         client.getPost(key).then(res => {
            //             console.log('got post', res)
            //             // emit(evs.post.got, res)
            //         })
            //     }
            // },

            view: PostView
        }
    })


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
