import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
import { render } from 'preact'
// var createHash = require('crypto').createHash
var route = require('route-event')()
var router = require('./router')()
var Shell = require('./view/shell')
var observ = require('observ')
var struct = require('observ-struct')
var Bus = require('@nichoth/events')
var raf = require('raf')
var evs = require('./EVENTS')
var Keys  = require('./keys')
// import createAuth0Client from '@auth0/auth0-spa-js';
// var config = require('./auth_config.json')

var bus = Bus({
    memo: true
});

var keys = Keys.get() || Keys.save(Keys.create())
// var keys = Keys.create()

var state = struct({
    feed: observ(null),
    route: observ('/'),
    me: observ(keys)
});

subscribe(bus, state)

route(function onRoute (path) {
    state.route.set(path)

    var emit = bus.emit.bind(bus)

    render(html`<${Connector} emit=${emit} state=${state} />`,
        document.getElementById('content'))
})

// connect preact state with observ state
function Connector ({ emit, state }) {
    const [_state, setState] = useState(state())

    state(function onChange (newState) {
        console.log('on change', newState)
        raf(() => setState(newState))
    })

    var match = router.match(_state.route)
    console.log('match', match)
    if (!match) console.log('not match')
    var route = match ? match.action(match) : null
    var routeView = route ? route.view : null

    return html`<${Shell} emit=${emit} ...${_state} me=${keys}>
        <${routeView} emit=${emit} ...${_state} me=${keys} />
    <//>`
}

console.log('wooo')

function subscribe (bus, state) {
    bus.on(evs.feed.got, msgs => {
        console.log('got feed', msgs)
        state.feed.set(msgs)
    })

    bus.on(evs.id.got, ev => {
        console.log('got id', ev)
        state.id.set(ev.id)
    })
}
