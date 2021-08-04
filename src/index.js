import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
import { render } from 'preact'
var route = require('route-event')()
var Bus = require('@nichoth/events')
var raf = require('raf')
var evs = require('./EVENTS')
var Keys  = require('./keys')
var Identity = require('./identity')
var subscribe = require('./subscribe')
var State = require('./state')
var router = require('./router')()
var Shell = require('./view/shell')
// var createHash = require('create-hash')
// const sha256 = require('simple-sha256')
// var ssc = require('@nichoth/ssc')

if (process.env.NODE_ENV === 'test') {
    var Client = require('./client')
    var { getFollowing, follow, setNameAvatar, testPost,
        getRelevantPosts, getPostsWithFoafs } = Client()
}

var bus = Bus({ memo: true })

var keys = Keys.get() || null

bus.emit(evs.keys.got, keys)

// @TODO -- should use server to store the user name
var profile = Identity.get() || null
var state = State(keys, profile)
subscribe(bus, state)


// TODO -- around here, make a request to get the profile from server,
// and set the profile in state/local-storage if it is different

// TODO -- need to handle the case where state.me is not set

var emit = bus.emit.bind(bus)

// here check the NODE_ENV
// follow a 2nd person if it's `test`
console.log('aaaa')
if (process.env.NODE_ENV === 'test') {
    console.log('bbbbbb', 'test only')
    // console.log('my id', state().me.secrets.id)
    var me = state.me()
    var myKeys = me.secrets
    // console.log('**my keys**', myKeys)

    // TODO
    // do a foaf follow. This means you follow userOne, userOne
    // follows userTwo, and userTwo creates a post

    var userOneKeys = window.userOneKeys = {
        "curve": "ed25519",
        "public": "g+Aw6QpfN+hlXTUQUlXZ3z6d56se+I8JQiRrJo/nfIE=.ed25519",
        "private": "aQGqFH0HXj+zNaQbRbBbGjACzU92KprVetem9ji0jJyD4DDpCl836GVdNRBSVdnfPp3nqx74jwlCJGsmj+d8gQ==.ed25519",
        "id": "@g+Aw6QpfN+hlXTUQUlXZ3z6d56se+I8JQiRrJo/nfIE=.ed25519"
    }

    var userTwoKeys = window.userTwoKeys = {
        "curve": "ed25519",
        "public": "u0MOa3J2abucXDHblubJh48kDuGpU2ZhuPA9ioNp/OY=.ed25519",
        "private": "kuZuJORTMJuZzJKqHX1qbr4AGvPTbYfgx1/JV90lw3a7Qw5rcnZpu5xcMduW5smHjyQO4alTZmG48D2Kg2n85g==.ed25519",
        "id": "@u0MOa3J2abucXDHblubJh48kDuGpU2ZhuPA9ioNp/OY=.ed25519"
    }

    window.followUserOne = function () {
        follow(myKeys, userOneKeys)
            .then(res => {
                console.log('success follow user one', res)
            })
            .catch(err => {
                console.log('oh no', err)
            })
    }

    // post a msg where userOne follows another user
    window.followFoaf = function () {
        // console.log('foafing')

        // have userOne follow userTwo
        follow(userOneKeys, userTwoKeys)
            .then(res => {
                console.log('success following foaf', res)
            })
    }

    window.userOneName = function () {
        // console.log('user one keys', userOneKeys)
        setNameAvatar('userOne', userOneKeys)
            .then(res => {
                if (!res.ok) {
                    return res.text().then(t => console.log('tttt', t))
                }
                // console.log('success', res)
            })
            .catch(err => {
                console.log('errrrr', err)
            })
    }

    window.userTwoName = function () {
        setNameAvatar('userTwo', userTwoKeys)
            .then(res => {
                // console.log('success user two name', res)
            })
            .catch(err => {
                console.log('errrrr', err)
            })
    }

    window.user2Post = function () {
        testPost('test content', userTwoKeys)
            .then(res => {
                // console.log('posted user 2 msg', res)
            })
    }


    window.getFoafPosts = function () {
        // console.log('my id', state().me.secrets.id)
        getPostsWithFoafs(state.me.secrets().id)
            .then(res => {
                console.log('**got foaf posts**', res.msg)
                // emit(evs.relevantPosts.got, res.msg)
            })
    }

    window.setNameAvatar = setNameAvatar

    window.testStuff = function testStuff (text) {
        follow(myKeys, userOneKeys)
            .then(json => {
                getFollowing(state().me.secrets.id)
                    .then(res => {
                        console.log('**got following**', res)
                        emit(evs.following.got, res)
                    })
                    .catch(err => {
                        console.log('oh no following errrrr', err)
                    })

                console.log('jsonnnnnnnnnn follow post res', json)
                // once you're following userTwo, check that their post
                // shows up on the home page
                // call get `relevantPosts` after posting
                testPost('', userOneKeys)
                    .then(res => {
                        console.log('**test post res**', res)

                        getRelevantPosts(me.secrets.id)
                            .then(res => {
                                // console.log('**got relevant posts**', res)
                                emit(evs.feed.got, res.msg)
                            })
                            .catch(err => {
                                console.log('errrrrr', err)
                            })
                    })
            })
            .catch(err => {
                console.log('oh noooooooooo', err)
            })
    }
}


// save the profile to localStorage when it changes
// it gets set in the view functions i think
// should do this is the subscription
state.me.profile(function onChange (profile) {
    console.log('***profile change', profile)
    Identity.save(profile)
})

route(function onRoute (path) {
    // we update the state here with the path
    // then the `connector` finds the view via the router
    state.route.set(path)
    var { setRoute } = route

    render(html`<${Connector} emit=${emit} state=${state}
        setRoute=${setRoute}
    />`, document.getElementById('content'))
})

// connect preact state with observ state
function Connector ({ emit, state, setRoute }) {
    const [_state, setState] = useState(state())

    state(function onChange (newState) {
        raf(() => {
            setState(newState)
        })
    })

    var match = router.match(_state.route)
    // console.log('match', match)
    if (!match) console.log('not match')
    var { params } = match
    var route = match ? match.action(match) : null
    var routeView = route ? route.view : null
    var subView = route ? route.subView : null

    return html`<${Shell} setRoute=${setRoute} emit=${emit} ...${_state}
        path=${_state.route}
    >
        <${routeView} emit=${emit} ...${_state} params=${params}
            setRoute=${setRoute}
            path=${_state.route}
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
