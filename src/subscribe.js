var evs = require('./EVENTS')
var Keys = require('./keys')
var xtend = require('xtend')

function subscribe (bus, state) {

    bus.on(evs.identity.setName, name => {
        console.log('set name event', state(), name)
        state.me.profile.userName.set(name)
    })

    bus.on(evs.identity.gotAvatar, ev => {
        // console.log('got avatar', ev)
        state.me.avatar.set({ url: ev.avatarUrl })
    })

    bus.on(evs.identity.setAvatar, ev => {
        console.log('set avatar', ev)
        var file = ev.target.files[0]
        console.log('file', file)

        const reader = new FileReader()

        reader.onloadend = () => {
            console.log('done reading file')
            uploadAvatar(reader.result, state)
                .then(res => {
                    console.log('**success**', res)
                })
                .catch(err => {
                    console.log('errrrrrrr', err)
                })
        }

        // this gives us base64
        reader.readAsDataURL(file)
    })

    bus.on(evs.feed.got, ({ userId, msgs }) => {
        // state.feed.set(msgs)
        var newState = {}
        newState[userId] = msgs
        state.userFeeds.set(xtend(state.userFeeds(), newState))
    })

    bus.on(evs.profile.got, ev => {
        var { id } = ev
        var newState = {}
        newStat[id] = ev
        state.profiles.set(xtend(state.profiles(), newState))
    })

    bus.on(evs.relevantPosts.got, msgs => {
        state.relevantPosts.set(msgs)
    })

    bus.on(evs.keys.got, ev => {
        var { secrets, source } = ev
        console.log('key bus', secrets)
        Keys.save(secrets)
        state.me.secrets.set(secrets)
        state.me.source.set(source || null)
    })

    bus.on(evs.following.got, ev => {
        console.log('**got following in subscribe**', ev)
        state.following.set(ev)
    })
}

module.exports = subscribe

function uploadAvatar (file, state) {
    var keys = state().me.secrets

    // need to get the hash

    // var content = {
    //     type: 'avatar',
    //     about: id,
    //     mentions: [hash]
    // }

    return fetch('/.netlify/functions/avatar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            file: file,
            keys: { public: keys.public }
        })
    })
        .then(response => {
            // console.log('respspsps', response)
            if (!response.ok) {
                return response.text()
                    .then(t => {
                        console.log('not ok', t)
                        console.log('blabla eerrrgg', t)
                    })
            }

            return response.json()
        })
        .then(json => {
            console.log('**avatar res json**', json)
            console.log(json.message)
        })
}
