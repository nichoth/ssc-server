// require('dotenv').config()
require('isomorphic-fetch')
var ssc = require('@nichoth/ssc/web')
var createHash = require('create-hash')
// const sha256 = require('simple-sha256')
// const xtend = require('xtend')
// import ky from 'ky-universal';

var baseUrl = 'http://localhost:8888'
var BASE = (process.env.NODE_ENV === 'test' ?  baseUrl : '')

// this is a client-side file that calls our API

// window.sha256 = sha256

module.exports = function Client (keystore) {

    const client = {
        getProfile: function getProfile (did) {
            const qs = new URLSearchParams({ did }).toString()
            var url = (BASE + '/.netlify/functions/profile' + '?' + qs)
            return fetch(url)
        },

        // must pass a username
        // image is optional (should use existing image if there is not a new one)
        postProfile: function (did, username, image) {
            console.log('*posting in client*', arguments)

            if (!username) return Promise.reject(
                new Error('must include username'))


            var hash = createHash('sha256')
            hash.update(image)
            var _hash = hash.digest('base64')

            console.log('____hash_____', _hash)

            return ssc.createMsg(keystore, null, {
                type: 'about',
                about: did,
                username,
                image: (_hash || null)
            }).then(msg => {
                console.log('mssssssssssssssg', msg)

                return fetch(BASE + '/.netlify/functions/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        did,
                        msg,
                        file: image
                    })
                })
            })

            // return sha256('' + image).then(hash => {
            //     console.log('*****image*****', '' + image)
            //     console.log('***********img hash*************', hash)

            //     ssc.createMsg(keystore, null, {
            //         type: 'about',
            //         about: did,
            //         username,
            //         image: (_hash || null)
            //     }).then(msg => {
            //         console.log('mssssssssssssssg', msg)

            //         return fetch(BASE + '/.netlify/functions/profile', {
            //             method: 'POST',
            //             headers: { 'Content-Type': 'application/json' },
            //             body: JSON.stringify({
            //                 did,
            //                 msg,
            //                 file: image
            //             })
            //         })
            //     })

            // })
            // .catch(err => {
            //     console.log('hash errrrrrrrrrrrr', err)
            // })
        }
    }

    return client

//     var client = {
//         followMe: function followMe (keys, password) {
//             console.log('**test pw**', process.env.TEST_PW)
//             return fetch(BASE + '/.netlify/functions/follow-me', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     user: keys.id,
//                     password: (password || process.env.TEST_PW)
//                 })
//             })
//                 .then(res => {
//                     if (!res.ok) {
//                         console.log('**not ok**')
//                         return Promise.reject(res.text())
//                     }

//                     console.log('****okok', res)
//                     return res.json()
//                 })
//                 .catch(err => {
//                     console.log('err in herere', err)
//                 })
//         },

//         getPostsWithFoafs: function (userId) {
//             var qs = new URLSearchParams({
//                 userId: userId,
//                 foafs: true
//             }).toString()

//             var url = (BASE + '/.netlify/functions/get-relevant-posts' +
//                 '?' + qs)

//             return fetch(url)
//                 .then(res => {
//                     if (!res.ok) {
//                         return res.text().then(text => Promise.reject(text))
//                     }
//                     return res.json()
//                 })
//         },

//         getRelevantPosts: function (userId) {
//             var qs = new URLSearchParams({
//                 userId: userId
//             }).toString()

//             return fetch(BASE + '/.netlify/functions/get-relevant-posts' +
//                 '?' + qs)
//                 .then(res => {
//                     if (!res.ok) {
//                         return Promise.reject(res.text())
//                     }
//                     return res.json()
//                 })
//         },

//         follow: function (myKeys, userKeys) {
//             var followMsg = ssc.createMsg(myKeys, null, {
//                 type: 'follow',
//                 contact: userKeys.id,
//                 author: myKeys.id
//             })

//             return fetch(BASE + '/.netlify/functions/following', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     keys: { public: myKeys.public },
//                     msg: followMsg
//                 }) 
//             })
//                 .then(res => {
//                     if (!res.ok) {
//                         return res.text().then(text => {
//                             return Promise.reject(text)
//                         })
//                     }
//                     return res.json()
//                 })
//                 .catch(err => {
//                     console.log('ohhh nooo', err)
//                     throw err
//                 })
//         },

//         unfollow: function (keys, unfollowKeys) {
//             var unfollowMsg = ssc.createMsg(keys, null, {
//                 type: 'unfollow',
//                 contact: unfollowKeys.id,
//                 author: keys.id
//             })

//             return fetch(BASE + '/.netlify/functions/unfollow', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     keys: { public: keys.public, id: keys.id },
//                     msg: unfollowMsg
//                 }) 
//             })
//                 .then(res => {
//                     if (!res.ok) {
//                         return res.text().then(text => {
//                             return Promise.reject(text)
//                         })
//                     }

//                     return res.json()
//                 })
//         },

//         setProfile: function (keys, file, data) {
//             file = file || null
//             if (!data.name && !file) {
//                 throw new Error('need a name or an avatar')
//             }

//             var msg = ssc.createMsg(keys, null, xtend(data, {
//                 type: 'profile',
//                 about: keys.id,
//             }))

//             // @TODO -- get the previous message before posting a new one

//             return fetch(BASE + '/.netlify/functions/profile', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     keys: { public: keys.public },
//                     file: file,
//                     msg: msg
//                 }) 
//             })
//                 .then(res => {
//                     return res.json()
//                 })
//                 .catch(err => {
//                     console.log('ohhh nooo', err)
//                     throw err
//                 })
//         },

//         getFollowing: function (author) {
//             // console.log('**author**', author)
//             // this should return a map of followed IDs => profile data

//             // we request the list of who you're following,
//             // then you need to get the latest feeds for each person you're following
//             var qs = new URLSearchParams({ author }).toString();

//             return fetch(BASE + '/.netlify/functions/following' + '?' + qs)
//                 .then(res => {
//                     console.log('foll res', res)
//                     if (!res.ok) {
//                         return res.text().then(t => {
//                             var msg = JSON.parse(t).message
//                             throw new Error(msg)
//                         })
//                     }

//                     return res.json()
//                 })
//                 .catch(err => {
//                     throw err
//                 })
//         },

//         setNameAvatar: function (name, userKeys) {
//             var nameMsg = ssc.createMsg(userKeys, null, {
//                 type: 'about',
//                 about: userKeys.id,
//                 name: name || 'fooo'
//             })

//             console.log('**name msg**', nameMsg)

//             console.log('**public**', userKeys)
//             console.log('**public**', userKeys.public)

//             // set name
//             return fetch(BASE + '/.netlify/functions/abouts', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     keys: { public: userKeys.public },
//                     msg: nameMsg
//                 }) 
//             })
//                 .then(res => {
//                     console.log('**set name res**', res)
//                     if (!res.ok) {
//                         return res.text().then(t => {
//                             console.log('oh no errr', t)
//                             return t
//                         })
//                     }

//                     // base64 smiling cube
//                     var file = 'data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7'
//                     return setAvatar(file, userKeys)
//                 })
//                 .catch(err => {
//                     console.log('aarrrrrr', err)
//                 })

//             function setAvatar (file, userKeys) {
//                 return fetch(BASE + '/.netlify/functions/avatar', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({
//                         keys: { public: userKeys.public },
//                         file
//                         // msg: avatarMsg
//                     })
//                 })
//                     .then(res => {
//                         if (!res.ok) {
//                             return res.text()
//                                 .then(t => {
//                                     console.log('text', t)
//                                     return t
//                                 })
//                         }

//                         return res.json().then(json => {
//                             console.log('**avatar res**', json)
//                             return json
//                         })
//                     })
//                     .catch(err => {
//                         console.log('errr avatar', err)
//                     })
//             }

//         },

//         getFeedByName: function getFeedByName (name) {
//             var qs = new URLSearchParams({
//                 username: name
//             }).toString();

//             return fetch(BASE + '/.netlify/functions/feed-by-name' + '?' + qs)
//                 .then(res => res.json())
//         },

//         post: function post (keys, msg, file) {
//             return fetch(BASE + '/.netlify/functions/post-one-message', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     msg: msg,
//                     keys: keys,
//                     file: file
//                 }) 
//             })
//                 .then(res => {
//                     if (!res.ok) {
//                         return res.text().then(t => {
//                             return Promise.reject(new Error(t))
//                         })
//                     } else {
//                         return res.json()
//                     }
//                 })
//         },

//         testPost: function testPost (content, userKeys) {
//             // a smiling face
//             var file = 'data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7'

//             // var _hash = sha256.sync(file)
//             var hash = createHash('sha256')
//             hash.update(file)
//             var _hash = hash.digest('base64')

//             // post a 'post' from userTwo
//             var postMsg = ssc.createMsg(userKeys, null, {
//                 type: 'post',
//                 text: content || 'the post text content',
//                 mentions: [_hash]
//             })

//             return fetch(BASE + '/.netlify/functions/post-one-message', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     msg: postMsg,
//                     keys: userKeys,
//                     file: file
//                 }) 
//             })
//                 .then(res => res.json())
//                 .catch(err => {
//                     console.log('aaaaarrgggg', err)
//                 })
//         },

//         followMe: function (keys, password) {
//             return fetch(BASE + '/.netlify/functions/follow-me', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     user: keys.id,
//                     password: password
//                 })
//             })
//                 .then(res => {
//                     return res.json()
//                 })
//         },

//         createInvitation: function (keys) {
//             var msg = ssc.createMsg(keys, null, {
//                 type: 'invitation',
//                 from: keys.id
//             })

//             return fetch(BASE + '/.netlify/functions/create-invitation', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     publicKey: keys.public,
//                     msg: msg
//                 })
//             })
//                 .then(res => {
//                     if (!res.ok) {
//                         return res.text().then(t => {
//                             return Promise.reject(t)
//                         })
//                     }

//                     return res.json()
//                 })
//         },

//         redeemInvitation: function redeemInvitation (keys, code) {
//             return fetch(BASE + '/.netlify/functions/redeem-invitation', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     publicKey: keys.public,
//                     code: code,
//                     signature: ssc.sign(keys, code)
//                 })
//             })
//                 .then(res => {
//                     if (!res.ok) {
//                         return res.text().then(t => Promise.reject(t))
//                     }
//                     return res.json()
//                 })
//         }

//     }


}