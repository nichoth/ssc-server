var base = 'http://localhost:8888'
require('dotenv').config()
require('isomorphic-fetch')
var fs = require('fs')
var caracal = fs.readFileSync(__dirname + '/../caracal.jpg')
let base64Caracal = 'data:image/png;base64,' + caracal.toString('base64')
var createHash = require('crypto').createHash
var ssc = require('@nichoth/ssc')
var Client = require('../../src/client')
var client = Client()

var hash = createHash('sha256')
hash.update(base64Caracal)
var fileHash = hash.digest('base64')

module.exports = function postTests (test) {
    test('a post from someone the server is not following', t => {
        var keys = ssc.createKeys()
        var content = { type: 'test', text: 'foo', mentions: [fileHash] }
        var msg = ssc.createMsg(keys, null, content)

        client.post(keys, msg, base64Caracal)
            .then(res => {
                console.log('resssss', res)
                t.fail('should not get an ok response')
                t.end()
            })
            .catch(err => {
                t.pass('should get an error response')
                t.end()
            })
    })

    var msgOne
    var keys
    test('a post from someone you are following', t => {
        keys = ssc.createKeys()
        var content = { type: 'test', text: 'foo', mentions: [fileHash] }

        followMe(keys)
            .then(() => {
                var _msg = msgOne = ssc.createMsg(keys, null, content)
                return client.post(keys, _msg, base64Caracal)
            })
            .then(res => {
                t.pass('should get an ok response')
                t.equal(res.msg.value.author, keys.id, 'should have' +
                    ' the right msg author')
                t.end()
            })
            .catch(err => {
                console.log('errrrrrr', err)
                t.fail('error')
                t.end()
            })
    })

    test('try posting a message with no mentions array', t => {
        content = { type: 'test', text: 'bar' }
        // ( keys, prev, content )
        var msg = ssc.createMsg(keys, msgOne, content)
        client.post(keys, msg, base64Caracal)
            .then(res => {
                console.log('resssssssssss', res)
                t.fail('should not get an `ok` response')
                t.end()
            })
            .catch(err => {
                console.log('errrrrrr', err)
                t.pass('Should get an error response')
                t.ok(err.toString().includes('invalid message'),
                    'should have the right error message')
                t.end()
            })
    })

    test('post a second message', t => {
        var msg2 = ssc.createMsg(keys, msgOne, {
            type: 'test2',
            text: 'ok',
            mentions: [fileHash]
        })

        client.post(keys, msg2, base64Caracal)
            .then(res => {
                t.pass('should get an ok response')
                t.equal(res.msg.value.author, keys.id, 'should have' +
                    ' the right msg author')
                t.end()
            })
            .catch(() => {
                t.fail('error')
                t.end()
            })
    })
}

function followMe (keys) {
    return fetch(base + '/.netlify/functions/follow-me', {
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
            if (!res.ok) {
                console.log('**not ok**')
                // res.text().then(t => console.log('ttt', t))
                return Promise.reject(res.text())
            }

            return res.json()
        })
}
