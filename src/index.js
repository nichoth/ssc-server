import { html } from 'htm/preact'
import { render } from 'preact'
var route = require('route-event')()
var Bus = require('@nichoth/events')
const ssc = require('@nichoth/ssc/web')
var subscribe = require('./subscribe')
var State = require('./state')
const Connector = require('./connector')
const config = require('./config.json')
var { appName, admins } = config
appName = appName || 'ssc-demo'
const Client = require('./client')

console.log('NODE_ENV', process.env.NODE_ENV)

ssc.createKeys(ssc.keyTypes.ECC, { storeName: appName }).then(keystore => {
    var state = State(keystore, { admins })
    var bus = Bus({ memo: true })
    subscribe(bus, state)
    const client = Client(keystore)

    state(function onChange (newState) {
        console.log('change', newState)
    })

    // for testing
    window.state = state

    var emit = bus.emit.bind(bus)

    route(function onRoute (path) {
        console.log('**on route**', path)
        state.route.set(path)
    })



    // need to call to get username & profile in here
    // don't show anything before your username has returned

    ssc.getDidFromKeys(keystore).then(did => {
        state.me.did.set(did)

        const adminInfo = (state.admins() || []).find(user => user.did === did)

        state.me.isAdmin.set(!!adminInfo)

        client.getProfile(did).then(res => {
            state.me.profile.hasFetched.set(true)

            if (!res.ok) {
                res.text().then(txt => {
                    // console.log('*errrr text*', txt)
                    if (txt.includes('invalid DID')) {
                        console.log('**invalid did**', res)
                    }

                    state.me.profile.err.set(txt)

                    const noProfile = (state.me.profile.hasFetched() &&
                        state.me.profile.err())

                    // TODO -- handle the case where you have redeemed an
                    // invitation, but have not set a profile

                    if (noProfile) {
                        // if no profile, then go to an intro screen
                        route.setRoute('/hello')
                    }

                    // render the app *after* you fetch the profile initially
                    render(html`<${Connector} emit=${emit} state=${state}
                        setRoute=${route.setRoute} client=${client}
                    />`, document.getElementById('content'))
                })
            } else {
                console.log('got profile ok')

                res.json().then(json => {
                    console.log('json', json)
                    const { username, image } = json.value.content
                    state.me.profile.err.set(null)
                    state.me.profile.username.set(username)
                    state.me.profile.image.set(image || null)

                    // render the app *after* you fetch the profile initially
                    render(html`<${Connector} emit=${emit} state=${state}
                        setRoute=${route.setRoute} client=${client}
                    />`, document.getElementById('content'))
                })
            }
        })
        .catch(err => {
            console.log('profile errrr', err)
        })

    })
})
