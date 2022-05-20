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
// dids is a map of { username: { did, username } }
const lastUser = dids ? dids.lastUser : null

console.log('LS_NAME', LS_NAME)
console.log('*dids*', dids)

console.log('**store name**', (lastUser || {}).username)


// here, the first time the app loads, it is called appName
// after that, it is lastUser.username

// need to get the right storename

// the first time the app loads, we use `appName`
// the second time it loads, we have `username` in localStorage



// how to save the `appName` as the lastUser in localStorage?




// lastUser.username vs appName
// _need_ to use the same appName

// _must_ fetch the username before loading the keys

// if ((lastUser || {}).did) {
//     Client.GetProfile((lastUser || {}).did)
//         .then(res => {
//             console.log('got profile', res)
//         })
// } else {

// }




// aaa vs ssc-demo
// my DID is saved in localForage under `ssc-demo`
// when the app re-loads, we use the name `aaa`, b/c that was saved
//   as  `lastUser`
//   this creates a separate DID, b/c different localForage instance

// is appName the source of truth? or is it localStorage


// appName is the 'default' user
ssc.createKeys(ssc.keyTypes.ECC, {
    storeName: (lastUser || {}).username || appName
    // storeName: appName
}).then(keystore => {
    console.log('keystore', keystore)
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

    // don't show anything before your username has returned

    ssc.getDidFromKeys(keystore).then(did => {
        state.me.did.set(did)

        if (process.env.NODE_ENV === 'test') {
            console.log('**my did**', did)
        }

        client.getProfile(did).then(res => {
            console.log('res***', res)
            state.me.profile.hasFetched.set(true)

            emit(evs.identity.setProfile, res.value.content)

            // render the app *after* you fetch the profile initially
            render(html`<${Connector} emit=${emit} state=${state}
                setRoute=${route.setRoute} client=${client}
            />`, document.getElementById('content'))
        })
        .catch(err => {
            console.log('profile errrr', err)
        })

    })
})
