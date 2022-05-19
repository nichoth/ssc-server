import { html } from 'htm/preact'
import { render } from 'preact'
var route = require('route-event')()
var Bus = require('@nichoth/events')
const ssc = require('@nichoth/ssc/web')
var subscribe = require('./subscribe')
var State = require('./state')
const Connector = require('./connector')
const config = require('./config.json')
var { appName, admins, CLOUDINARY_CLOUD_NAME } = config
appName = appName || 'ssc-demo'
const Client = require('./client')
const evs = require('./EVENTS')
const { LS_NAME } = require('./constants')

console.log('*appName*', appName)
console.log('*NODE_ENV*', process.env.NODE_ENV)
console.log('*CLOUDINARY NAME*', CLOUDINARY_CLOUD_NAME)

const dids = JSON.parse(window.localStorage.getItem(LS_NAME))
// lastDid should be a username (string) that can be used to create a keystore
const lastUser = dids ? dids.lastUser : null

// appName is the 'default' user
ssc.createKeys(ssc.keyTypes.ECC, { storeName: lastUser || appName }).then(keystore => {
    // const dids = JSON.parse(localStorage.getItem(LS_NAME))
    // dids is a map of { username: {did object} }
    const state = State(keystore, { admins, dids })
    var bus = Bus({ memo: true })
    const client = Client(keystore)
    subscribe(bus, state)

    state(function onChange (newState) {
        console.log('change', newState)
    })

    // for testing
    window.state = state
    window.LS_NAME = LS_NAME

    var emit = bus.emit.bind(bus)

    route(function onRoute (path) {
        console.log('**on route**', path)
        state.route.set(path)
    })

    // need to call to get profile in here
    // don't show anything before your username has returned

    ssc.getDidFromKeys(keystore).then(did => {
        state.me.did.set(did)

        if (process.env.NODE_ENV === 'test') {
            console.log('**my did**', did)
        }

        client.getProfile(did).then(res => {
            state.me.profile.hasFetched.set(true)

            emit(evs.identity.setProfile, res.value.content)

            // render the app *after* you fetch the profile initially
            render(html`<${Connector} emit=${emit} state=${state}
                setRoute=${route.setRoute} client=${client}
            />`, document.getElementById('content'))

            // if (!res.ok) {
            //     res.text().then(txt => {
            //         // console.log('*errrr text*', txt)
            //         if (txt.includes('invalid DID')) {
            //             console.log('**invalid did**', res)
            //         }

            //         state.me.profile.err.set(txt)

            //         const noProfile = (state.me.profile.hasFetched() &&
            //             state.me.profile.err())

            //         // TODO -- handle the case where you have redeemed an
            //         // invitation, but have not set a profile

            //         if (noProfile) {
            //             // if no profile, then go to an intro screen
            //             route.setRoute('/hello')
            //         }

            //         // render the app *after* you fetch the profile initially
            //         render(html`<${Connector} emit=${emit} state=${state}
            //             setRoute=${route.setRoute} client=${client}
            //         />`, document.getElementById('content'))
            //     })
            // } else {
                // emit(evs.identity.setProfile, json.value.content)

                // // render the app *after* you fetch the profile initially
                // render(html`<${Connector} emit=${emit} state=${state}
                //     setRoute=${route.setRoute} client=${client}
                // />`, document.getElementById('content'))
            // }
        })
        .catch(err => {
            console.log('profile errrr', err)
        })

    })
})
