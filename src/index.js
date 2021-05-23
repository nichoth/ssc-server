import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
import { render } from 'preact'
// var createHash = require('crypto').createHash
var route = require('route-event')()
var router = require('./router')()
var Shell = require('./view/shell')
var ssc = require('@nichoth/ssc')
var observ = require('observ')
var struct = require('observ-struct')
var Bus = require('@nichoth/events')
var raf = require('raf')
var evs = require('./EVENTS')
import createAuth0Client from '@auth0/auth0-spa-js';
var config = require('./auth_config.json')

var bus = Bus({
    memo: true
});






var auth0 = window.auth0 = null
window.doLogin = doLogin
var accessToken = null

createAuth0Client({
    domain: config.domain,
    client_id: config.clientId
}).then(async res => {
    auth0 = window.auth0 = res
    console.log('auth0000', auth0)

    // handle the state where this is a callback page-load

    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        // Process the login state
        auth0.handleRedirectCallback()
            .then(res => {
                console.log('*****handled redirect cb', res)


                auth0.getTokenSilently().then(token => {
                    console.log('***token', token)
                    accessToken = token
                });

                auth0.getUser().then(user => {
                    console.log('****user', user)
                })


            })
            .catch(err => console.log('errrrrrrr', err));
        
        // Use replaceState to redirect the user away and remove the
        // querystring parameters
        window.history.replaceState({}, document.title, "/");
    }
})





function doLogin () {
    // auth0.loginWithPopup()
    // await auth0.loginWithRedirect();

    console.log('auth0', auth0)

    auth0.loginWithRedirect({
        redirect_uri: 'http://localhost:8888'
        // redirect_uri: 'https://ssc-server.netlify.app/login/callback'
    }).then(res => {
        console.log('login with redirect', res)
    })
    .catch(err => console.log('errrrrrr', err));
}





// error_description=The+redirect_uri+MUST+match+the+registered+callback+URL+
// for+this+application.&
// error_uri=https%3A%2F%2Fdocs.github.com%2Fapps%2Fmanaging-oauth-apps%2Ftroubleshooting-authorization-request-errors%2F%23redirect-uri-mismatch&state=oqe3L2DjSCZWie_E247cQR4icvetQB4k







// @TODO should keep track of keys
var keys = ssc.createKeys();

var state = struct({
    feed: observ(null),
    route: observ('/')
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
}
