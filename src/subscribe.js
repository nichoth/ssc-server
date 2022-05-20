var evs = require('./EVENTS')
const { LS_NAME } = require('./constants')
const xtend = require('xtend')

function subscribe (bus, state) {
    bus.on('*', (name, ev) => {
        console.log('***star***', name, ev)
    })

    // this event means 'there is a new DID now'
    // bus.on(evs.identity.newDid, ev => {
    //     state.dids.set(xtend(state.dids(), ev))
    // })

    // this event means 'the app is changing to use this new DID'
    bus.on(evs.identity.change, ({ did, keystore, profile }) => {
        // this changes the "active" DID that the app is using
        console.log('change DID', did)
        state.me.keys.set(keystore)
        state.me.did.set(did)
        state.me.profile.set(xtend(state.me.profile(), profile))
        // need to re-fetch the data that the app is using
    })

    bus.on(evs.pin.post, ev => {
        state.pin.set(ev.value.content.text)
    })

    bus.on(evs.pin.error, err => {
        console.log('rrrrr', err)
    })

    bus.on(evs.identity.setAvatar, ev => {
        console.log('*set avatar*', ev)
        state.me.profile.image.set(ev.image.id)
    })

    bus.on(evs.identity.setUsername, ev => {
        const { username } = ev
        state.me.profile.username.set(username)
    })

    bus.on(evs.identity.setDesc, ev => {
        state.me.profile.desc.set(ev.content.desc)
    })

    bus.on(evs.identity.setProfile, ev => {
        const { username, image, desc, about } = ev
        console.log('**ev**', ev)
        // handle lastUser key
        // const dids = (JSON.parse(window.localStorage.getItem(LS_NAME)) || {})
        // dids[username] = { did: about, username }
        // // dids is a map of { username: { did, username } }
        // const lastUser = { did: about, username }
        // dids.lastUser = lastUser
        // console.log('aaaaaaaaaaa', LS_NAME, JSON.stringify(dids))
        // window.localStorage.setItem(LS_NAME, JSON.stringify(dids))

        state.me.profile.username.set(username)
        state.me.profile.image.set(image)
        state.me.profile.desc.set(desc)
    })
}

module.exports = subscribe






    // bus.on('*', ev => {
    //     // console.log('***star***', ev)
    // })

//     bus.on(evs.following.stop, userId => {
//         // console.log('**unfollow event**', userId)
//         client.unfollow(state.me.secrets(), { id: userId })
//             .then((res) => {

//                 // console.log('**unfollow res**', res, userId)

//                 // need to set the state for following
//                 console.log('unfollow res', res)

//                 // need to re-request the posts
//                 getPostsWithFoafs(state.me.secrets().id)
//                     .then(res => {
//                         // console.log('**got relevants', res)
//                         state.relevantPosts.set(res.msg)
//                     })

//                 // console.log('***stopped following', res)
//                 var newState = xtend(state.following())
//                 console.log('**new state unfollowing***', newState)
//                 delete newState[userId]
//                 state.following.set(newState)
//             })
//             .catch(err => {
//                 console.log('errr', err)
//             })
//     })

//     bus.on(evs.following.start, userId => {
//         // in here, need to call the server with the follow req,
//         // server needs to responsd with the profile for this user
//         // and set state with the new following list
//         // and set state with the new post list
//         client.follow(state.me.secrets(), { id: userId })
//             .then(res => {

//                 // in here, request the messages since your foaf range
//                 // is larger now
//                 getPostsWithFoafs(state.me.secrets().id)
//                     .then(res => {
//                         // console.log('***got relevant posts', res)
//                         state.relevantPosts.set(res.msg)
//                     })
//                     .catch(err => {
//                         console.log('errrrrr', err)
//                     })


//                 // console.log('***started following', res)
//                 // state following list is like
//                 // { userId: {userData} }
//                 var newState = {}
//                 newState[userId] = res.value.content
//                 var _state = xtend(state.following(), newState)
//                 console.log('**content**', res.value.content)
//                 console.log('___state', _state)
//                 state.following.set(_state)
//             })
//             .catch(err => {
//                 console.log('errrrrr', err)
//             })
//     })

//     bus.on(evs.identity.setName, name => {
//         // console.log('set name event', state(), name)
//         state.me.profile.userName.set(name)
//     })

//     bus.on(evs.identity.gotAvatar, ev => {
//         // console.log('got avatar', ev)
//         state.me.avatar.set({ url: ev.avatarUrl })
//     })

//     bus.on(evs.identity.setAvatar, ev => {
//         console.log('set avatar', ev)
//         var file = ev.target.files[0]
//         console.log('file', file)

//         const reader = new FileReader()

//         reader.onloadend = () => {
//             console.log('done reading file')
//             uploadAvatar(reader.result, state)
//                 .then(res => {
//                     // console.log('**success**', res)
//                 })
//                 .catch(err => {
//                     console.log('errrrrrrr', err)
//                 })
//         }

//         // this gives us base64
//         reader.readAsDataURL(file)
//     })

//     bus.on(evs.feed.got, ({ userId, msgs }) => {
//         // state.feed.set(msgs)
//         var newState = {}
//         newState[userId] = msgs
//         state.userFeeds.set(xtend(state.userFeeds(), newState))
//     })

//     bus.on(evs.profile.got, ev => {
//         var { id } = ev
//         var newState = {}
//         newState[id] = ev
//         state.profiles.set(xtend(state.profiles(), newState))
//     })

//     bus.on(evs.relevantPosts.got, msgs => {
//         state.relevantPosts.set(msgs)
//     })

//     bus.on(evs.keys.got, ev => {
//         var { secrets, source } = ev
//         Keys.save(secrets)
//         state.me.secrets.set(secrets)
//         state.me.source.set(source || null)
//     })

//     bus.on(evs.following.got, ev => {
//         console.log('**got following**', ev)
//         state.following.set(ev)
//     })

//     bus.on(evs.following.err, err => {
//         state.following.set(xtend(state.following() || {}, {
//             err: err.message
//         }))
//     })

//     bus.on(evs.userFeed.got, ev => {
//         var { name, feed } = ev
//         var feeds = state.userFeeds()
//         feeds[name] = feed
//         state.userFeeds.set(feeds)
//     })
// }

// module.exports = subscribe

// function uploadAvatar (file, state) {
//     var keys = state().me.secrets

//     // need to get the hash

//     // var content = {
//     //     type: 'avatar',
//     //     about: id,
//     //     mentions: [hash]
//     // }

//     return fetch('/.netlify/functions/avatar', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             file: file,
//             keys: { public: keys.public }
//         })
//     })
//         .then(response => {
//             // console.log('respspsps', response)
//             if (!response.ok) {
//                 return response.text()
//                     .then(t => {
//                         console.log('not ok', t)
//                         console.log('blabla eerrrgg', t)
//                     })
//             }

//             return response.json()
//         })
//         .then(json => {
//             // console.log('**avatar res json**', json)
//             console.log(json.message)
//         })
// }
