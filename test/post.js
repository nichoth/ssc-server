require('dotenv').config()
require('isomorphic-fetch')
const fs = require('fs')
const ssc = require('@nichoth/ssc-lambda')
const Post = require('../src/client/post')
const test = require('tape')
const onExit = require('signal-exit')
const setup = require('./setup')
const BASE = 'http://localhost:8888'

if (require.main === module) {
    var _keys
    var ntl
    var _did

    test('setup', function (t) {
        setup(t.test, ({ netlify, keys, did }) => {
            ntl = netlify
            _keys = keys
            _did = did

            onExit(() => {
                ntl.kill('SIGINT')
            })

            t.end()
        })
    })

    test('posts', t => {
        postTest(t.test, _keys, _did)
        t.end()
    })

    test('all done', function (t) {
        ntl.kill()
        t.end()
    })
}

function postTest (test, keys) {
    var firstPost
    const pic = fs.readFileSync(__dirname + '/caracal.jpg')
    const file = Buffer.from(pic).toString('base64')

    test('save a valid post from an admin', t => {
        Post.create(ssc, keys, [file], { text: 'a test post' })
            .then(res => {
                firstPost = res.value
                t.equal(res.value.content.type, 'post',
                    "should have type='post'")
                t.equal(res.value.content.text, 'a test post',
                    'should return the newly created message')
                t.end()
            })
            .catch(err => {
                t.fail(err.toString())
                t.end()
            })
    })

    test('create a second valid post from the same admin user', t => {
        Post.create(ssc, keys, [file], { text: 'test post 2' }, firstPost)
            .then(res => {
                t.equal(res.value.content.text, 'test post 2',
                    'should return the new message')
                t.end()
            })
            .catch(err => {
                t.fail(err)
                t.end()
            })
    })

    test('post an invalid message from a valid user', t => {
        ssc.createMsg(keys, null, {
            type: 'post',
            text: 'bad merkle sequence'
        }).then(msg => {
            fetch(BASE + '/api/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: [file], msg })
            })
                .then(res => {
                    if (res.ok) {
                        t.fail('response should not be ok')
                        t.end()
                    }

                    res.text().then(text => {
                        t.equal(text, 'invalid signature',
                            'should return the expected error message')
                        t.end()
                    })
                })
                .catch(err => {
                    console.log('errrrrr', err)
                    t.fail('err')
                    t.end()
                })
            })
    })
}
