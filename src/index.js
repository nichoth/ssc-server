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

var bus = Bus({ memo: true })


// @TODO -- should use server to store the user name
var profile = Identity.get() || null
var keys = Keys.get() || null
bus.emit(evs.keys.got, keys)
var state = State(keys, profile)
subscribe(bus, state)

if (process.env.NODE_ENV === 'test') {
    require('./test-stuff')(state)
}


// TODO -- around here, make a request to get the profile from server,
// and set the profile in state/local-storage if it is different

// TODO -- need to handle the case where state.me is not set

var emit = bus.emit.bind(bus)

// save the profile to localStorage when it changes
// it gets set in the view functions i think
// should do this is the subscription
state.me.profile(function onChange (profile) {
    console.log('***profile change', profile)
    Identity.save(profile)
})

route(function onRoute (path) {
    // we update the state here with the path
    // then the `connector` finds the view via the router
    state.route.set(path)
})

var { setRoute } = route

render(html`<${Connector} emit=${emit} state=${state}
    setRoute=${setRoute}
/>`, document.getElementById('content'))


// connect preact state with observ state
function Connector ({ emit, state, setRoute }) {
    const [_state, setState] = useState(state())

    // here we connect `state` to the preact state
    state(function onChange (newState) {
        raf(() => {
            setState(newState)
        })
    })

    var match = router.match(_state.route)
    if (!match) console.log('not match')
    var { params } = match
    var route = match ? match.action(match) : null
    var routeView = route ? route.view : null
    var subView = route ? route.subView : null

    return html`<${Shell} setRoute=${setRoute} emit=${emit} ...${_state}
        path=${_state.route}
    >
        <${routeView} emit=${emit} ...${_state} params=${params}
            setRoute=${setRoute}
            path=${_state.route}
        >
            ${subView ?
                html`<${subView} emit=${emit} ...${_state}
                    setRoute=${setRoute}
                />` :
                null
            }
        <//>
    <//>`
}
