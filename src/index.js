import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
import { render } from 'preact'
var route = require('route-event')()
var Bus = require('@nichoth/events')
var raf = require('raf')
var evs = require('./EVENTS')
var Keys  = require('./keys')
var Identity = require('./identity')
var subscribe = require('./subscribe')
var State = require('./state')
var router = require('./router')()
var Shell = require('./view/shell')
// var createHash = require('create-hash')
// const sha256 = require('simple-sha256')
// var ssc = require('@nichoth/ssc')

if (process.env.NODE_ENV === 'test') {
    var Client = require('./client')
    var { getFollowing, follow, setNameAvatar, testPost,
        getRelevantPosts } = Client()
}

var bus = Bus({ memo: true })

var keys = Keys.get() || null

bus.emit(evs.keys.got, keys)

var profile = Identity.get() || null
var state = State(keys, profile)
subscribe(bus, state)


// TODO -- around here, make a request to get the profile from server,
// and set the profile in state/local-storage if it is different

// TODO -- need to handle the case where state.me is not set

var emit = bus.emit.bind(bus)

// here check the NODE_ENV
// follow a 2nd person if it's `test`
console.log('aaaa')
if (process.env.NODE_ENV === 'test') {
    console.log('bbbbbb', 'test only')
    console.log('my id', state().me.secrets.id)
    var me = state.me()
    var myKeys = me.secrets
    console.log('**my keys**', myKeys)

    window.setNameAvatar = setNameAvatar

    window.testStuff = function testStuff (text) {
        follow(myKeys)
            .then(json => {
                getFollowing(state().me.secrets.id)
                    .then(res => {
                        console.log('**got following**', res)
                        emit(evs.following.got, res)
                    })
                    .catch(err => {
                        console.log('oh no following errrrr', err)
                    })

                console.log('jsonnnnnnnnnn follow post res', json)
                // once you're following userTwo, check that their post
                // shows up on the home page
                // call get `relevantPosts` after posting
                testPost()
                    .then(res => {
                        console.log('**test post res**', res)
                        getRelevantPosts(me.secrets.id)
                            .then(res => {
                                // console.log('**got relevant posts**', res)
                                emit(evs.feed.got, res.msg)
                            })
                            .catch(err => {
                                console.log('errrrrr', err)
                            })
                    })
            })
            .catch(err => {
                console.log('oh noooooooooo', err)
            })
    }
}


// save the profile to localStorage when it changes
// it gets set in the view functions i think
state.me.profile(function onChange (profile) {
    console.log('***profile change', profile)
    Identity.save(profile)
})

route(function onRoute (path) {
    // we update the state here with the path
    // then the `connector` finds the view via the router
    state.route.set(path)

    render(html`<${Connector} emit=${emit} state=${state} />`,
        document.getElementById('content'))
})

// connect preact state with observ state
function Connector ({ emit, state }) {
    const [_state, setState] = useState(state())

    state(function onChange (newState) {
        raf(() => {
            // console.log('on change', newState)
            setState(newState)
        })
    })

    var match = router.match(_state.route)
    console.log('match', match)
    if (!match) console.log('not match')
    var { params } = match
    var route = match ? match.action(match) : null
    var routeView = route ? route.view : null
    var subView = route ? route.subView : null

    return html`<${Shell} emit=${emit} ...${_state} path=${_state.route}>
        <${routeView} emit=${emit} ...${_state} params=${params}
            path=${_state.route}
        >
            ${subView ?
                html`<${subView} emit=${emit} ...${_state} />` :
                null
            }
        <//>
    <//>`
}
