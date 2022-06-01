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

const env = process.env.NODE_ENV

// dids is a map of { did: { did, username, image: hash, storeName } }
// storeName is the name for the localForage store
const dids = JSON.parse(window.localStorage.getItem(LS_NAME))
const lastUser = dids ? dids.lastUser : null

function getRandomInt (max) {
    return Math.floor(Math.random() * max);
}

// const storeName = (dids ? dids[lastUser] : {}).storeName || appName
const storeName = env === 'cypress' ?
    // how to get a random storeName?
    getRandomInt(9999) :
    (dids ? dids[lastUser] : {}).storeName || appName


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


        // @TODO -- in here, fetch the `follow` endpoint

        Promise.all([
            client.serverFollows(did),
            client.getProfile(did)
        ])
            .then(([follow, profile]) => {
                console.log('follow and profile', follow, profile)

                // what does it mean if you *are* an admin but the server
                // doesn't follow you?
                // if you are an admin, you should have full privileges
                if (follow) console.log('aaaaaaaaaaaaa', follow)

                state.me.profile.hasFetched.set(true)
                const { username, image } = profile.value.content
                const _dids = dids || {}
                _dids[did] = { storeName, username, image, did }
                _dids.lastUser = did
                window.localStorage.setItem(LS_NAME, JSON.stringify(_dids))

                emit(evs.identity.setProfile, profile.value.content)

                // ???how to handle error in profile???

                // render the app *after* you fetch the profile initially
                render(html`<${Connector} emit=${emit} state=${state}
                    setRoute=${route.setRoute} client=${client}
                />`, document.getElementById('content'))
            })
            .catch(err => {
                console.log('***profile errrr***', err)
                route.setRoute('/hello')
                render(html`<${Connector} emit=${emit} state=${state}
                    setRoute=${route.setRoute} client=${client}
                />`, document.getElementById('content'))
            })

    })
})
