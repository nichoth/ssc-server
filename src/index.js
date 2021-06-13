import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
import { render } from 'preact'
var route = require('route-event')()
var Bus = require('@nichoth/events')
var raf = require('raf')
var Keys  = require('./keys')
var Identity = require('./identity')
var subscribe = require('./subscribe')
var State = require('./state')
var router = require('./router')()
var Shell = require('./view/shell')

var bus = Bus({ memo: true })

var keys = Keys.get() || null
var profile = Identity.get() || null
var state = State(keys, profile)
subscribe(bus, state)



// TODO -- around here, make a request to get the profile from server

// TODO -- get the following list
// TODO -- need to handle the case where state.me is not set

// we request the list of who you're following,
// then you need to get the latest feeds for each person you're following
// could do this client side
// or could make a ss function called `getLatest` or something, which would
// get the relevant pictures for this ID
var qs = new URLSearchParams({ author: state().me.secrets.id }).toString();
console.log('following qs', qs)

fetch('/.netlify/functions/following' + '?' + qs)
    .then(res => {
        console.log('got following res', res)
    })
    .catch(err => {
        console.log('err woe', err)
    })


// save the profile to localStorage when it changes
// it gets set in the view functions i think
state.profile(function onChange (profile) {
    console.log('***profile change', profile)
    Identity.save(profile)
})

route(function onRoute (path) {
    // we update the state here with the path
    // then the `connector` finds the view via the router
    state.route.set(path)

    var emit = bus.emit.bind(bus)

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
