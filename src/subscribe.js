var evs = require('./EVENTS')
// var Keys = require('./keys')
// var xtend = require('xtend')
// const sscKeys = require('./keys')
// var client = require('./client')()
// var { getPostsWithFoafs } = client
// const ssc = require('@nichoth/ssc/web')
// const sha256 = require('simple-sha256')

function subscribe (bus, state) {
    bus.on('*', ev => {
        console.log('***star***', ev)
    })

    bus.on(evs.pin.got, ev => {
        console.log('*pin in subscribe*', ev)
        state.pin.set(ev)
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
        console.log('*set username in subscribe*', username)
    })

    bus.on(evs.identity.setProfile, ev => {
        const { username, image } = ev
        state.me.profile.username.set(username)
        state.me.profile.image.set(image)
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
