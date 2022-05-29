require('dotenv').config()
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc-lambda')
const test = require('tape')
const onExit = require('signal-exit')
const setup = require('./setup')
const BASE = 'http://localhost:8888'
const u = require('./util')

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
                // console.log('exit')
            })

            t.end()
        })
    })

    test('alternates', t => {
        alt(t.test, _keys, _did)
        t.end()
    })

    test('all done', function (t) {
        ntl.kill()
        t.end()
    })
}

module.exports = alt

function alt (test, keys, did) {
    // keys here is for the 'admin' user
    // (the one creating an alt)
    test('save an alt message as an admin', t => {
        ssc.createMsg(keys, null, {
            type: 'alternate',
            from: did,
            to: '123'
        }).then(msg => {
            fetch(BASE + '/.netlify/functions/alternate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            }).then(res => {
                if (!res.ok) {
                    res.text().then(text => {
                        console.log('errrrrrrrrrrr', text)
                        t.fail()
                        return t.end()
                    })
                }
                return res.json()
            }).then(res => {
                t.equal(res.key, ssc.getId(res.value),
                    'should return the expected key')
                t.equal(res.value.content.to, '123',
                    'should have the right "to" in msg content')
                t.equal(res.value.content.type, 'alternate',
                    'should return the right message type')
                t.end()
            })
        })
    })

    test('save an alt message as a random user', t => {
        ssc.createKeys().then(user => {
            return ssc.createMsg(user.keys, null, {
                type: 'alternate',
                from: user.did,
                to: '123'
            })
        })
            .then(msg => {
                return fetch(BASE + '/.netlify/functions/alternate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(msg)
                })
            })
            .then(res => {
                t.notOk(res.ok, 'should not return an ok response')
                t.equal(res.status, 403, 'should return 403 code')
                t.end()
            })
    })

    test('save an alternate message as a standard user', t => {
        ssc.createKeys()
            .then(user => {
                return u.inviteAndFollow({ adminKeys: keys, user })
            })
            .then(() => {
                return ssc.createMsg(keys, null, {
                    type: 'alternate',
                    from: did,
                    to: '123'
                })
            })
            .then(msg => {
                return fetch(BASE + '/api/alternate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(msg)
                })
            })
            .then(res => {
                t.ok(res.ok, 'should return an ok response')
                t.end()
            })
    })
}
