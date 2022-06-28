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

// const env = process.env.NODE_ENV

// dids is a map of { did: { did, username, image: hash, storeName } }
// storeName is the name for the localForage store
const dids = JSON.parse(window.localStorage.getItem(LS_NAME))
const lastUser = dids ? dids.lastUser : null

console.log('*alternate dids*', dids)

// function getRandomInt (max) {
//     return Math.floor(Math.random() * max);
// }

// const storeName = env === 'cypress' ?
//     // how to get a random storeName?
//     getRandomInt(9999) :
//     (dids ? dids[lastUser] : {}).storeName || appName

const storeName = (dids ? dids[lastUser] : {}).storeName || appName



console.log('**storename**', storeName)
ssc.createKeys(ssc.keyTypes.ECC, { storeName }).then(keystore => {
    const state = State(keystore, { admins, dids })
    var bus = Bus({ memo: true })
    const client = Client(keystore)
    subscribe(bus, state, client)


    if (process.env.NODE_ENV === 'test') {
        window.client = client
    }


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
        window.scrollTo(0, 0)
    })

    function getFirstData (did) {
        return Promise.all([
            client.serverFollows(did),
            client.getProfile(did),
            client.getFeed(did),
            client.getRelevantPosts(did),
            client.getFollowing(did)
        ])
            .then(([serverFollows, profile, feed, posts, following]) => {
                console.log('initial fetch', serverFollows, profile, feed,
                    posts, following)

                console.log('feed', feed)
                console.log('postssssssssssssssssss', posts)
                console.log('follllllllllllll', following)

                state.relevantPosts.set(posts)
                state.me.profile.hasFetched.set(true)
                Profile.set(profile.value.content)
                emit(evs.identity.setProfile, profile.value.content)
                const feedEv = {}
                feedEv[did] = feed
                emit(evs.feed.got, feedEv)
                emit(evs.following.got, following.reduce((obj, msg) => {
                    obj[msg.value.author] = msg.value.content
                    return obj
                }, {}))

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
    }

    // don't show anything before your username has returned
    ssc.getDidFromKeys(keystore).then(did => {
        state.me.did.set(did)

        if (process.env.NODE_ENV === 'test') {
            console.log('**my did**', did)
        }

        const isAdmin = (admins || []).find(user => user.did === did)
        if (isAdmin) {
            // you can only invite people if you are an *admin*
            // that rule may change in the future
            client.getRedemptions(did)
                .then(res => {
                    const didsToFollow = res.map(msg => msg.value.author)
                    console.log('dids to follow', didsToFollow)

                    // here, make a function, like `followViaInvitation`
                    // that will follow them, and also delete the redemption msg
                    // return client.follow(didsToFollow)

                    if (!didsToFollow.length) return null

                    return client.followViaInvitation(didsToFollow)
                })
                .then(followResponse => {
                    console.log('follow response', followResponse)
                    return getFirstData(did)
                })
                .catch(err => {
                    if (err.toString().includes('no redemptions waiting')) {
                        // do nothing
                        console.log('you dont have to follow anyone')
                        return getFirstData(did)
                    }

                    throw err
                })
        } else {
            getFirstData(did)
        }
    })
})
