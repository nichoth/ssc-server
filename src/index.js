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
const Profile = require('./profile')

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


// need to be able to start this with a new user...


console.log('**storename**', storeName)
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

        const isAdmin = (admins || []).find(user => user.did === did)
        if (isAdmin) {
            client.getRedemptions(did)
                .then(res => {
                    console.log('redemptionssssssssssssss', res)
                    // TODO -- follow people here
                })
                .catch(err => {
                    if (err.toString().includes('no redemptions waiting')) {
                        // do nothing
                        return console.log('you dont have to follow anyone')
                    }

                    throw err
                })
        }

        // @TODO -- in here, fetch the `follow` endpoint -- see who you are
        //   following

        Promise.all([
            client.serverFollows(did),
            client.getProfile(did)
        ])
            .then(([follow, profile]) => {
                console.log('follow and profile', follow, profile)

                state.me.profile.hasFetched.set(true)
                Profile.set(profile.value.content)
                emit(evs.identity.setProfile, profile.value.content)

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
