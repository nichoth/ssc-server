import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
import { render } from 'preact'
var route = require('route-event')()
var router = require('./router')()
var Shell = require('./view/shell')
var observ = require('observ')
var struct = require('observ-struct')
var Bus = require('@nichoth/events')
var raf = require('raf')
var evs = require('./EVENTS')
var Keys  = require('./keys')
// var xtend = require('xtend')
// var Identity = require('./identity')

var bus = Bus({
    memo: true
});

var keys = Keys.get() || null

var state = struct({
    feed: observ(null),
    route: observ('/'),
    me: struct({
        source: observ(null),
        secrets: observ(keys),
        userName: observ(''),
        isResolving: observ(false)
    })
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

    return html`<${Shell} emit=${emit} ...${_state} path=${_state.route}>
        <${routeView} emit=${emit} ...${_state} />
    <//>`
}

console.log('wooo')

function subscribe (bus, state) {

    bus.on(evs.identity.setName, name => {
        console.log('set name event', name)

        state.me.isResolving.set(true)







        var msgContent = {
            type: 'about',
            about: me.secrets.id,
            name: name
        }

        // @TODO
        // should use prev msg so we have a merkle list of 'about' type msgs
        // this can be an independent list from the 'feed'
        // should request the head of the 'about' list
        var prev = {}






        // make a call to the server
        fetch('/.netlify/functions/set-name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                keys: me.secrets,
                msg: ssc.createMsg(keys, prev || null, msgContent)
            })
        })
            .then(res => {
                console.log('res', res)
                return res.json()
            })
            .then(json => {
                state.me.userName.set(json.name)
                state.me.isResolving.set(false)
            })
            .catch(err => {
                console.log('errrr in home', err)
                state.me.isResolving.set(false)
            })

        // then set the name in state after the result
    })

    bus.on(evs.feed.got, msgs => {
        console.log('got feed', msgs)
        state.feed.set(msgs)
    })

    bus.on(evs.keys.got, ev => {
        var { secrets, source } = ev
        console.log('key bus', secrets)
        Keys.save(secrets)
        state.me.secrets.set(secrets)
        state.me.source.set(source || null)
    })
}
