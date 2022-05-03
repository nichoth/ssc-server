import { useState } from 'preact/hooks';
var raf = require('raf')
import { html } from 'htm/preact'
var router = require('./router')()
var Shell = require('./view/shell')

module.exports = Connector

// connect preact state with observ state
function Connector ({ emit, state, setRoute }) {
    const [_state, setState] = useState(state())

    // connect `state` to the preact state
    state(function onChange (newState) {
        raf(() => {
            setState(newState)
        })
    })

    console.log('state.route', _state.route)

    var match = router.match(_state.route)
    console.log('match', match)

    if (!match) {
        console.log('not match')
        return null
    }
    var { params } = match
    var route = match ? match.action(match) : null
    var routeView = route ? route.view : null
    var subView = route ? route.subView : null

    // don't show the `shell` component in this case
    if (match.route === '/hello' || match.route === '/invitation') {
        return html`<${routeView} setRoute=${setRoute} emit=${emit}
            ...${_state} path=${_state.route}
        />`
    }

    console.log('in connector')

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
