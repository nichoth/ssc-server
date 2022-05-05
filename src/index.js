import { html } from 'htm/preact'
import { render } from 'preact'
var route = require('route-event')()
var Bus = require('@nichoth/events')
const ssc = require('@nichoth/ssc/web')
var subscribe = require('./subscribe')
var State = require('./state')
const Connector = require('./connector')
var { appName, admins } = require('./config.json')
appName = appName || 'ssc-demo'
const client = require('./client')()

ssc.createKeys(ssc.keyTypes.ECC, { storeName: appName }).then(keystore => {
    var state = State(keystore)
    var bus = Bus({ memo: true })
    subscribe(bus, state)

    state(function onChange (newState) {
        console.log('change', newState)
    })

    // for testing
    window.state = state

    var emit = bus.emit.bind(bus)

    route(function onRoute (path) {
        console.log('**on route**', path)

        // const noProfile = (state.me.profile().hasFetched &&
        //     state.me.profile().err)

        // if (noProfile) return route.setRoute('/hello')

        // if (!state.me.profile.username() && path !== '/hello') {
        //     console.log('!!!not profile!!!')
        //     return route.setRoute('/hello')
        // }

        state.route.set(path)
    })


    // console.log('node env', process.env.NODE_ENV)


    // need to call to get username & profile in here
    // don't show anything before your username has returned
    

    ssc.getDidFromKeys(keystore).then(did => {
        state.me.did.set(did)

        client.getProfile(did).then(res => {
            console.log('aaa got profile aaa', res)
            state.me.profile.hasFetched.set(true)

            if (!res.ok) {
                res.text().then(txt => {
                    console.log('*errrr text*', txt)
                    if (txt.includes('invalid DID')) {
                        state.me.profile.err.set(txt)
                    }

                    const noProfile = (state.me.profile().hasFetched &&
                        state.me.profile().err)

                    // TODO -- handle the case where you have redeemed an
                    // invitation, but have not set a profile

                    if (noProfile) {
                        // if no profile, then go to an intro screen
                        route.setRoute('/hello')
                    }
                })
            }

            render(html`<${Connector} emit=${emit} state=${state}
                admins=${admins} setRoute=${route.setRoute}
            />`, document.getElementById('content'))
        })
        .catch(err => {
            console.log('profile errrr', err)
        })
    })
})
