var ssc = require('@nichoth/ssc')
var createHash = require('create-hash')

module.exports = function Client () {
    // var userKeys = ssc.createKeys()

    var client = {
        getPostsWithFoafs: function (userId) {
            var qs = new URLSearchParams({
                userId: userId,
                foafs: true
            }).toString()

            return fetch('/.netlify/functions/get-relevant-posts' + '?' + qs)
                .then(res => {
                    return res.json()
                })
        },

        getRelevantPosts: function (userId) {
            var qs = new URLSearchParams({
                userId: userId
            }).toString()

            return fetch('/.netlify/functions/get-relevant-posts' + '?' + qs)
                .then(res => {
                    return res.json()
                })
        },

        follow: function (myKeys, userKeys) {
            var followMsg = ssc.createMsg(myKeys, null, {
                type: 'follow',
                contact: userKeys.id,
                author: myKeys.id
            })


            return fetch('/.netlify/functions/following', {
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
                .catch(err => {
                    console.log('oh noooooooooo', err)
                })
        },

        getFollowing: function (author) {
            // console.log('**author**', author)
            // this should return a map of followed IDs => profile data

            // we request the list of who you're following,
            // then you need to get the latest feeds for each person you're following
            var qs = new URLSearchParams({
                author
                // author: state().me.secrets.id
            }).toString();

            return fetch('/.netlify/functions/following' + '?' + qs)
                .then(res => res.json())
        },

        setNameAvatar: function (name, userKeys) {
            var nameMsg = ssc.createMsg(userKeys, null, {
                type: 'about',
                about: userKeys.id,
                name: name || 'fooo'
            })

            console.log('**name msg**', nameMsg)

            console.log('**public**', userKeys)
            console.log('**public**', userKeys.public)

            // set name
            return fetch('/.netlify/functions/abouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    keys: { public: userKeys.public },
                    msg: nameMsg
                }) 
            })
                .then(res => {
                    console.log('**set name res**', res)
                    if (!res.ok) {
                        return res.text().then(t => {
                            console.log('oh no errr', t)
                            return t
                        })
                    }

                    // base64 smiling cube
                    var file = 'data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7'
                    return setAvatar(file, userKeys)
                })
                .catch(err => {
                    console.log('aarrrrrr', err)
                })

            function setAvatar (file, userKeys) {
                return fetch('/.netlify/functions/avatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        keys: { public: userKeys.public },
                        file
                        // msg: avatarMsg
                    })
                })
                    .then(res => {
                        if (!res.ok) {
                            return res.text()
                                .then(t => {
                                    console.log('text', t)
                                    return t
                                })
                        }

                        return res.json().then(json => {
                            console.log('**avatar res**', json)
                            return json
                        })
                    })
                    .catch(err => {
                        console.log('errr avatar', err)
                    })
            }

        },

        getFeedByName: function getFeedByName (name, index) {

        },

        getProfileByName: function getProfileByName (name, index) {

        },

        testPost: function testPost (content, userKeys) {
            // a smiling face
            var file = 'data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7'

            // var _hash = sha256.sync(file)
            var hash = createHash('sha256')
            hash.update(file)
            var _hash = hash.digest('base64')

            // post a 'post' from userTwo
            var postMsg = ssc.createMsg(userKeys, null, {
                type: 'post',
                text: content || 'the post text content',
                mentions: [_hash]
            })

            return fetch('/.netlify/functions/post-one-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    msg: postMsg,
                    keys: userKeys,
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

    return client
}