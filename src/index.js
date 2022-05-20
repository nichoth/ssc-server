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

const storeName = (dids ? dids[dids.lastUser] : {}).storeName || appName

console.log('___storename____', storeName)



// need to fetch the profile before we create the keystore
// we have the most recent DID that was used b/c of localStorage




// appName is the 'default' user
ssc.createKeys(ssc.keyTypes.ECC, { storeName }).then(keystore => {
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
            state.me.profile.hasFetched.set(true)

            console.log('!!!!!app name store name!!!!!', appName, storeName)
            const { username, image } = res.value.content
            const _dids = dids || {}
            _dids[did] = { storeName, username, image, did }
            _dids.lastUser = did
            window.localStorage.setItem(LS_NAME, JSON.stringify(_dids))

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
