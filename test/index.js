require('dotenv').config()
require('isomorphic-fetch')
var test = require('tape')
// var { spawn } = require('child_process')
var ssc = require('@nichoth/ssc')
var fs = require('fs')
var createHash = require('crypto').createHash
var Client = require('../src/client')
var client = Client()
// var base = 'http://localhost:8888'

var { follow, getPostsWithFoafs, post } = Client()

var ntl
var keys = ssc.createKeys()
var userOneKeys = ssc.createKeys()
var userTwoKeys = ssc.createKeys()

// get the test file & its hash ready
var caracal = fs.readFileSync(__dirname + '/caracal.jpg')
let base64Caracal = 'data:image/png;base64,' + caracal.toString('base64')
var hash = createHash('sha256')
hash.update(base64Caracal)
var fileHash = hash.digest('base64')

var ntl
test('setup', function (t) {
    require('./setup')(t.test, (netlify) => {
        ntl = netlify
    })
    t.end()
})


test('following', t => {
    require('./follow/follow')(t.test, { keys, userOneKeys, userTwoKeys})
})

test('posts', t => {
    require('./post/post')(t.test)
})


var _msg
test('client.post', t => {
    var content = {
        type: 'test',
        text: 'test post content',
        mentions: [fileHash]
    }

    _msg = ssc.createMsg(keys, null, content)
    client.post(keys, _msg, base64Caracal)
        .then(res => {
            t.equal(res.msg.value.signature, _msg.signature,
                'should return the right signature')
            t.end()
        })
        .catch(err => {
            console.log('errrrrr', err)
            t.error(err)
            t.end()
        })
})


test('publish a second message', function (t) {
    var req2 = {
        keys: { public: keys.public },
        // in here we pass in the previous msg we created
        // createMsg(keys, prevMsg, content)
        msg: ssc.createMsg(keys, _msg, {
            type: 'test2',
            text: 'ok',
            mentions: [fileHash]
        }),
        file: base64Caracal
    }

    fetch('http://localhost:8888/.netlify/functions/post-one-message', {
        method: 'post',
        body:    JSON.stringify(req2),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(res => {
            t.pass('got a response')
            t.equal(res.msg.data.value.signature, req2.msg.signature,
                'should send back right signature')
            t.end()
        })
        .catch(err => {
            console.log('errrrrr', err)
            t.error(err)
            t.end()
        })
})

test('follow a user', function (t) {
    follow(keys, userOneKeys)
        .then(res => {
            t.equal(res.value.content.type, 'follow',
                'should post a follow message')
            t.equal(res.value.content.contact, userOneKeys.id,
                'should follow the right user ID')
            t.end()
        })
        .catch(err => {
            console.log('oh no', err)
            t.error(err)
            t.end()
        })
})

test('foaf follow', function (t) {
    follow(userOneKeys, userTwoKeys)
        .then(res => {
            t.equal(res.value.content.type, 'follow',
                'userOne should follow userTwo')
            t.end()
        })
        .catch(err => {
            console.log('errr', err)
            t.error(err)
            t.end()
        })
})

test('get foaf messages', t => {
    // need to do a post by userTwo
    // test file -- smiling face
    var msg = ssc.createMsg(userTwoKeys, null, {
        type: 'test',
        text: 'a post from user 2',
        mentions: [fileHash]
    })

    post({ public: userTwoKeys.public }, msg, base64Caracal)
        .then(() => {
            // console.log('**res to foaf puplish**', res)

            // then get the posts; pass in your id
            getPostsWithFoafs(keys.id)
                .then(res => {
                    // console.log('**got foaf posts**', JSON.stringify(res, null, 2))
                    // author should be userTwo
                    var post = res.msg.find(msg => {
                        return msg.value.author === userTwoKeys.id
                    })
                    t.ok(post, 'should return a post by user two')
                    t.end()
                })
        })
        .catch(err => {
            console.log('errrrr', err)
            t.error(err)
            t.end()
        })
})

test('get relevant posts', function (t) {
    console.log('todo')
    t.end()
})

test('all done', function (t) {
    ntl.kill()
    t.end()
})
