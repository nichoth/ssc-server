require('dotenv').config()
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc-lambda')
const test = require('tape')
const onExit = require('signal-exit')
const { setup, allDone } = require('./setup')
const BASE = 'http://localhost:8888'

if (require.main === module) {
    var _keys
    var ntl
    var _did

    test('setup', function (t) {
        // keys from `setup` is automatically written to `admins` array
        setup(t.test, ({ netlify, keys, did }) => {
            ntl = netlify
            _keys = keys
            _did = did

            onExit(() => {
                ntl.kill('SIGINT')
                // console.log('exit')
            })

            t.end()
        })
    })

    test('follow', t => {
        followTests(t.test, _keys, _did)
        t.end()
    })

    test('all done', function (t) {
        allDone(ntl)
        t.end()
    })
}

module.exports = followTests

function followTests (test, keys, did) {
    // `keys` here is an admin
    test('follow a DID', t => {
        ssc.createMsg(keys, null, {
            type: 'follow',
            contact: '123'  // DID of who you're following
        }).then(msg => {
            return fetch(BASE + '/.netlify/functions/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([msg])
            })
        })
        .then(res => {
            if (!res.ok) {
                res.text().then(text => {
                    t.fail(text)
                    t.end()
                })
            }
            return res.json()
        })
        .then(json => {
            t.equal(json[0].value.author, did,
                'should have the expected author')
            t.equal(json[0].value.content.contact, '123',
                'should return the new follow message')
            t.end()
        })

        // the author of the follow msgs **must be either an admin, or
        // someone the server follows**
    })


    test('follow multiple DIDs', t => {
        Promise.all([
            ssc.createMsg(keys, null, {
                type: 'follow',
                contact: '123'  // DID of who you're following
            }),
            ssc.createMsg(keys, null, {
                type: 'follow',
                contact: 'abc'
            })
        ]).then(msgs => {
            return fetch(BASE + '/.netlify/functions/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msgs)
            })
        })
        .then(res => {
            if (!res.ok) {
                res.text().then(text => {
                    t.fail(text)
                    t.end()
                })
            }
            return res.json()
        })
        .then(json => {
            t.equal(json.length, 2, 'should return the expected number of msgs')
            t.ok(json.every(msg => msg.value.author === did),
                'should return the expected author')
            t.equal(json[1].value.content.contact, 'abc',
                'should return follow messages in the expected order')
            t.end()
        })
    })
}
