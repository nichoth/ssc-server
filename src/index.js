import { html } from 'htm/preact'
import { render } from 'preact'
var route = require('route-event')()
var Bus = require('@nichoth/events')
const ssc = require('@nichoth/ssc/web')
var subscribe = require('./subscribe')
var State = require('./state')
const Connector = require('./connector')

ssc.createKeys(ssc.keyTypes.ECC, { storeName: 'ssc' }).then(keystore => {
    var state = State(keystore)
    var bus = Bus({ memo: true })
    subscribe(bus, state)

    // for testing
    window.state = state

    var emit = bus.emit.bind(bus)

    route(function onRoute (path) {
        console.log('**on route**', path)
        // // check this synchronously for now,
        // // change it later if necessary
        if (!state.me.profile.username() && path !== '/hello') {
        // if (!state.me().did && path !== '/hello') {
        // if (!state.me.secrets().id && path !== '/hello') {
            console.log('!!!not did!!!')
            // if you don't have an id, then go to a login screen
            return route.setRoute('/hello')
        }

        // if you have an ID, but the server is not following you,
        // show an invitation route

        state.route.set(path)
    })


    const path = route.getRoute()
    if (!state.me().did && path !== '/hello') {
        console.log('aaa not did')

        render(html`<${Connector} emit=${emit} state=${state}
            setRoute=${route.setRoute}
        />`, document.getElementById('content'))

        // if you don't have an id, then go to a login screen
        return route.setRoute('/hello')
    }

    render(html`<${Connector} emit=${emit} state=${state}
        setRoute=${route.setRoute}
    />`, document.getElementById('content'))
})
