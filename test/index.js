require('dotenv').config()
require('isomorphic-fetch')
var test = require('tape')
var { spawn } = require('child_process')
var ssc = require('@nichoth/ssc')
var fs = require('fs')
var createHash = require('crypto').createHash
var Client = require('../src/client')
var base = 'http://localhost:8888'

    // var { getFollowing, follow, setNameAvatar, testPost,
    //     getRelevantPosts, getPostsWithFoafs } = Client()

var { follow, getPostsWithFoafs, post } = Client()

var caracal = fs.readFileSync(__dirname + '/caracal.jpg')
let base64Caracal = 'data:image/png;base64,' + caracal.toString('base64')

// we are using temp keys only throughout this test file

var ntl
var keys = ssc.createKeys()
var userOneKeys = ssc.createKeys()
var userTwoKeys = ssc.createKeys()
var _msg

var hash = createHash('sha256')
hash.update(base64Caracal)
var fileHash = hash.digest('base64')

var client = Client()

// console.log('user one', userOneKeys.id)
// console.log('user two', userTwoKeys.id)

test('setup', function (t) {
    ntl = spawn('npx', ['netlify', 'dev', '--port=8888'])

    ntl.stdout.on('data', function (d) {
        if (d.toString().includes('Server now ready')) {
            t.end()
        }
    })

    ntl.stdout.pipe(process.stdout)
    ntl.stderr.pipe(process.stderr)

    ntl.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`)
    })

    ntl.on('close', (code) => {
        console.log(`child process exited with code ${code}`)
    })
})


test('follow me', t => {
    fetch(base + '/.netlify/functions/follow-me', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: keys.id,
            password: process.env.TEST_PW
        })
    })
        .then(res => {
            res.json().then(json => {
                t.equal(json.type, 'follow', 'should return the message')
                t.equal(json.contact, keys.id, 'should return the right id')
                t.end()
            })
        })
        .catch(err => {
            console.log('errrrrrr', err)
            e.error(err)
            t.end()
        })
})


test('follow the same user again', t => {
    fetch(base + '/.netlify/functions/follow-me', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: keys.id,
            password: process.env.TEST_PW
        })
    })
        .then(res => {
            t.equal(res.ok, false, 'should get an error response')
            if (!res.ok) {
                res.text().then(text => {
                    t.ok(text.includes('instance not unique'),
                        'should return the right error')
                    t.end()
                })
            }
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})


test('client.post', t => {
    var content = {
        type: 'test',
        text: 'test post content',
        mentions: [fileHash]
    }

    // use a temporary user, so it doesn't effect the merkle dag of others
    var tempKeys = ssc.createKeys()
    var msg = ssc.createMsg(tempKeys, null, content)
    client.post(tempKeys, msg, base64Caracal)
        .then(res => {
            t.equal(res.msg.value.signature, msg.signature,
                'should return the right signature')
            t.end()
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})


// * create and sign msg client side
test('publish one message', function (t) {
    var content = {
        type: 'test',
        text: 'waaaa',
        mentions: [fileHash]
    }

    _msg = ssc.createMsg(keys, null, content)

    // console.log('***the first msg***', _msg)

    // {
    //     previous: null,
    //     sequence: 1,
    //     author: '@x+KEmL4JmIKzK0eqR8vXLPUKSa87udWm+Enw2bsEiuU=.ed25519',
    //     timestamp: NaN,
    //     hash: 'sha256',
    //     content: { type: 'test', text: 'waaaa' },
    // eslint-disable-next-line
    //     signature: 'RQXRrMUMqRlANeSBrfZ1AVerC9xGJxEGscx1MZrJUqAVylwVfi5i5r1msyZzqi7FuDf7DYr3OOHrTIO2P6ufDQ==.sig.ed25519'
    //   }

    var reqBody = {
        keys: { public: keys.public },
        msg: _msg,
        file: base64Caracal
    }

    fetch('http://localhost:8888/.netlify/functions/post-one-message', {
        method: 'POST',
        body:    JSON.stringify(reqBody),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(res => res.json())
        .then(function (res) {
            var { msg } = res
            t.pass('got a response', res)
            t.ok(msg.mentionUrls, 'should have the image urls')
            t.equal(msg.value.signature, _msg.signature,
                'should send back the right signature')
            t.end()
        })
        .catch(err => {
            console.log('errrrr', err)
            t.error(err)
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
