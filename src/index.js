import { html } from 'htm/preact'
import { render } from 'preact'
// var createHash = require('crypto').createHash
var route = require('route-event')()
var router = require('./router')()
var Shell = require('./view/shell')

route(function onRoute (path) {
    console.log('path', path)
    var m = router.match(path)
    console.log('m', m)
    var { view } = m.action(m)

    render(html`<${Shell} path=${path}><${view} /><//>`,
        document.getElementById('content'))
})

console.log('wooo')
