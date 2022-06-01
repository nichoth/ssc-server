import { useState } from 'preact/hooks';
var raf = require('raf')
import { html } from 'htm/preact'
var router = require('./router')()
var Shell = require('./view/shell')

module.exports = Connector

// connect preact state with observ state
function Connector ({ emit, state, setRoute, client, storeName }) {
    const [_state, setState] = useState(state())
    console.log('view render', state())

    // connect `state` to the preact state
    state(function onChange (newState) {
        raf(() => {
            setState(newState)
        })
    })

    var match = router.match(_state.route)

    if (!match) {
        console.log('not match')
        return null
    }
    const { params } = match
    const route = match ? match.action(match) : null
    const routeView = route ? route.view : null
    const getContent = route.getContent
    const subView = route ? route.subView : null

    if (getContent) {
        getContent(state, client)
    }

    // don't show the `shell` component in this case
    if (match.route === '/hello' || match.route === '/invitation') {
        return html`<${routeView} setRoute=${setRoute} emit=${emit}
            ...${_state} path=${_state.route} client=${client}
        />`
    }

    return html`<${Shell} setRoute=${setRoute} emit=${emit} ...${_state}
        path=${_state.route} client=${client} 
    >
        <${routeView} emit=${emit} ...${_state} params=${params}
            setRoute=${setRoute}
            path=${_state.route}
            client=${client}
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
