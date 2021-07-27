require('dotenv').config()
require('isomorphic-fetch')
var test = require('tape')
var { spawn } = require('child_process')
var ssc = require('@nichoth/ssc')
var fs = require('fs')
var createHash = require('crypto').createHash
var Client = require('../src/client')
var client = Client()
var base = 'http://localhost:8888'

var { follow, getPostsWithFoafs, post } = Client()

var caracal = fs.readFileSync(__dirname + '/caracal.jpg')
let base64Caracal = 'data:image/png;base64,' + caracal.toString('base64')




var ntl
var keys = ssc.createKeys()
var userOneKeys = ssc.createKeys()
var userTwoKeys = ssc.createKeys()



var hash = createHash('sha256')
hash.update(base64Caracal)
var fileHash = hash.digest('base64')


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
    t.plan(3)

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
            })
        })
        .catch(err => {
            console.log('errrrrrr', err)
            e.error(err)
        })

    // we follow userTwo here also just because the later tests depend on it
    // (the foaf test)
    fetch(base + '/.netlify/functions/follow-me', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: userTwoKeys.id,
            password: process.env.TEST_PW
        })
    })
        .then(res => {
            res.json().then(json => {
                t.equal(json.contact, userTwoKeys.id,
                    'should follow user two')
            })
        })
        .catch(err => {
            t.error(err)
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
            res.text().then(text => {
                t.ok(text.includes('instance not unique'),
                    'should return the right error')
                t.end()
            })
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})


test('create an invitation as a user', function (t) {
    fetch(base + '/.netlify/functions/create-invitation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            publicKey: keys.public,
            msg: ssc.createMsg(keys, null, {
                type: 'invitation',
                from: keys.id
            })
        })
    })
        .then(res => res.json())
        .then(res => {
            console.log('****create invitation res****', res)
            t.ok(res.code, 'should return an invitation code')
            t.end()
        })
        .catch(err => {
            t.error(err, 'should not have an error')
            t.end()
        })
})

test("create an invitation from someone we're not following", t => {
    var failureKeys = ssc.createKeys()

    fetch(base + '/.netlify/functions/create-invitation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            publicKey: failureKeys.public,
            msg: ssc.createMsg(failureKeys, null, {
                type: 'invitation',
                from: failureKeys.id
            })
        })
    })
        .then(res => {
            t.notOk(res.ok, 'should have a falsy status')
            t.equal(res.status, 401, 'should have the error code 401')
            t.end()
        })
        .catch(err => {
            console.log('errrrr', err)
            t.error(err, 'should not return an error')
            t.end()
        })

})


test('redeem an invitation', function (t) {
    console.log('todo -- redeem invitation')
    t.end()
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
            // console.log('ressssssssss', res)
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
