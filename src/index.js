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

var ssc = require('@nichoth/ssc')

var bus = Bus({ memo: true })

var keys = Keys.get() || null

bus.emit(evs.keys.got, keys)

var profile = Identity.get() || null
var state = State(keys, profile)
subscribe(bus, state)





// TODO -- around here, make a request to get the profile from server,
// and set the profile in state if it is different

// TODO -- need to handle the case where state.me is not set





var emit = bus.emit.bind(bus)

// here check the NODE_ENV
// follow a 2nd person if it's `test`
console.log('aaaa')
if (process.env.NODE_ENV === 'test') {
    console.log('bbbbbb', 'test only')
    console.log('my id', state().me.secrets.id)
    var userTwo = ssc.createKeys()
    var myKeys = state().me.secrets
    var me = state.me()
    console.log('**my keys**', myKeys)
    console.log('**user two**', userTwo)

    var msgContent = {
        type: 'follow',
        contact: userTwo.id,
        author: myKeys.id
    }

    // call `getRelevantPosts` after following user 2 and
    // posting to their feed

    // post a follow msg
    // I should follow userTwo
    var msg = ssc.createMsg(myKeys, null, msgContent)

    window.testStuff = function testStuff () {
        fetch('/.netlify/functions/following', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                author: myKeys.id,
                keys: { public: myKeys.public },
                msg: msg
            }) 
        })
            .then(res => {
                if (!res.ok) return res.text()
                return res.json()
            })
            .then(json => {
                getFollowing()
                console.log('jsonnnnnnnnnn follow res', json)
                // once you're following userTwo, check that their post
                // shows up on the home page
                // call get `relevantPosts` after posting
                testPost()
                    .then(res => {
                        console.log('**done test posting**', res)
                        // now need to call `getRelevantPosts`

                        var qs = new URLSearchParams({
                            userId: me.secrets.id
                        }).toString()

                        fetch('/.netlify/functions/get-relevant-posts' +
                            '?' + qs)
                            .then(res => {
                                return res.json()
                            })
                            .then(json => {
                                console.log('got relevant posts', json)
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

    function testPost () {
        // post a 'post' from userTwo
        var postMsg = ssc.createMsg(userTwo, null, {
            type: 'post',
            text: 'the post text content'
        })

        var file = 'data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7'

        return fetch('/.netlify/functions/post-one-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                msg: postMsg,
                keys: userTwo,
                file: file
            }) 
        })
            .then(res => res.json())
            .then(json => {
                console.log('***post response json***', json)
                return json
            })
            .catch(err => {
                console.log('aaaaarrgggg', err)
            })
    }

}






function getPosts () {
    return fetch('/.netlify/functions/get-relevant-posts')
}






function getFollowing () {
    // we request the list of who you're following,
    // then you need to get the latest feeds for each person you're following
    var qs = new URLSearchParams({ author: state().me.secrets.id }).toString();
    return fetch('/.netlify/functions/following' + '?' + qs)
        .then(res => res.json())
        .then(json => {
            console.log('**following response**', json)
            emit(evs.following.got, json)
        })
        .catch(err => {
            console.log('err woe', err)
        })
}





// save the profile to localStorage when it changes
// it gets set in the view functions i think
state.me.profile(function onChange (profile) {
    console.log('***profile change', profile)
    Identity.save(profile)
})

route(function onRoute (path) {
    // we update the state here with the path
    // then the `connector` finds the view via the router
    state.route.set(path)

    render(html`<${Connector} emit=${emit} state=${state} />`,
        document.getElementById('content'))
})

// connect preact state with observ state
function Connector ({ emit, state }) {
    const [_state, setState] = useState(state())

    state(function onChange (newState) {
        raf(() => {
            // console.log('on change', newState)
            setState(newState)
        })
    })

    var match = router.match(_state.route)
    console.log('match', match)
    if (!match) console.log('not match')
    var { params } = match
    var route = match ? match.action(match) : null
    var routeView = route ? route.view : null
    var subView = route ? route.subView : null

    return html`<${Shell} emit=${emit} ...${_state} path=${_state.route}>
        <${routeView} emit=${emit} ...${_state} params=${params}
            path=${_state.route}
        >
            ${subView ?
                html`<${subView} emit=${emit} ...${_state} />` :
                null
            }
        <//>
    <//>`
}
