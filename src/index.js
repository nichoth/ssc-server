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
var createHash = require('create-hash')
// const sha256 = require('simple-sha256')


var ssc = require('@nichoth/ssc')

var bus = Bus({ memo: true })

var keys = Keys.get() || null

bus.emit(evs.keys.got, keys)

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
    console.log('my id', state().me.secrets.id)
    var userTwo = ssc.createKeys()
    var me = state.me()
    var myKeys = me.secrets
    console.log('**my keys**', myKeys)
    console.log('**user two**', userTwo)

    window.userTwo = userTwo

    // post a follow msg
    // userOne should follow userTwo
    var followMsg = ssc.createMsg(myKeys, null, {
        type: 'follow',
        contact: userTwo.id,
        author: myKeys.id
    })





    function setNameAvatar (name, avatar) {
        var nameMsg = ssc.createMsg(userTwo, null, {
            type: 'about',
            about: userTwo.id,
            name: 'fooo'
        })

        // set name
        fetch('/.netlify/functions/abouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                keys: { public: userTwo.public },
                msg: nameMsg
            }) 
        })
            .then(res => {
                console.log('**set name res**', res)
                setAvatar()
            })

        // fetch('setAvatar')
        function setAvatar () {
            // var avatarMsg = ssc.createMsg(userTwo, null, {
            // })

            fetch('/.netlify/functions/avatar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keys: { public: userTwo.public },
                    // base64 smiling cube
                    file: 'data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7',
                    // msg: avatarMsg
                })
            })
                .then(res => {
                    res.json()
                        .then(json => console.log('**avatar res**', json))
                    if (!res.ok) res.text().then(t => console.log('text', t))
                })
                .catch(err => {
                    console.log('errr avatar', err)
                })
        }
    }

    window.setNameAvatar = setNameAvatar





    window.testStuff = function testStuff () {
        // follow the userTwo
        fetch('/.netlify/functions/following', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                author: myKeys.id,
                keys: { public: myKeys.public },
                msg: followMsg
            }) 
        })
            .then(res => {
                if (!res.ok) return res.text()
                return res.json()
            })
            .then(json => {
                getFollowing()
                console.log('jsonnnnnnnnnn follow post res', json)
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
                                // console.log('got relevant posts', json)
                                console.log('got relevant posts', json.msg)
                                emit(evs.feed.got, json.msg)
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
        // a smiling face
        var file = 'data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7'

        // var _hash = sha256.sync(file)
        var hash = createHash('sha256')
        hash.update(file)
        var _hash = hash.digest('base64')

        // post a 'post' from userTwo
        var postMsg = ssc.createMsg(userTwo, null, {
            type: 'post',
            text: 'the post text content',
            mentions: [_hash]
        })

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


function getFollowing () {
    // this should return a map of followed IDs => profile data

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
