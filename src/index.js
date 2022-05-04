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

        if (!state.me.profile.username() && path !== '/hello') {
            console.log('!!!not profile!!!')
            return route.setRoute('/hello')
        }

        state.route.set(path)
    })


    const path = route.getRoute()
    if (!state.me().did && path !== '/hello') {

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
