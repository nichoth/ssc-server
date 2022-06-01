require('dotenv').config()
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc-lambda')
const test = require('tape')
const onExit = require('signal-exit')
const setup = require('./setup')
const BASE = 'http://localhost:8888'
const { v4: uuidv4 } = require('uuid')

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

    test('invitations', t => {
        invite(t.test, _keys, _did)
        t.end()
    })

    test('all done', function (t) {
        ntl.kill()
        t.end()
    })
}


function invite (test, keys) {
    var _code

    // keys here is for the 'admin' user
    test('create an invitaion as an admin', t => {
        const code = _code = uuidv4()

        ssc.createMsg(keys, null, {
            type: 'invitation',
            code
        }).then(msg => {
            fetch(BASE + '/.netlify/functions/invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            })
                .then(res => {
                    // check http error code
                    if (!res.ok) {
                        res.text().then(text => {
                            console.log('not ok', text)
                            t.fail(text)
                            t.end()
                        })
                    }

                    return res.json()
                })
                .then(res => {
                    if (!res) return
                    t.equal(res.value.content.code, msg.content.code, 
                        'should return the message after writing it')
                    t.end()
                })
        })
    })

    test('create an invitaion as a random person', t => {
        ssc.createKeys().then(user => {
            const { keys } = user

            ssc.createMsg(keys, null, {
                type: 'invitation',
                code: uuidv4()
            })
                .then(msg => {
                    return fetch(BASE + '/.netlify/functions/invitation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(msg)
                    })
                })
                .then(res => {
                    if (res.ok) {
                        t.fail('response should not be ok')
                        t.end()
                    }
                    return res.text()
                })
                .then(res => {
                    if (!res) return
                    t.equal(res, 'invalid DID',
                        'should return the expected error message')
                    t.end()
                })
        })
    })


    test('redeem an invitation with a valid code', t => {
        var _alice
        ssc.createKeys()
            .then(alice => {
                _alice = alice
                return ssc.createMsg(alice.keys, null, {
                    type: 'redeem-invitation',
                    code: _code
                })
            })
            .then(msg => {
                fetch(BASE + '/.netlify/functions/redeem-invitation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(msg)
                })
                    .then(res => {
                        if (!res.ok) {
                            res.text().then(text => {
                                t.fail(text)
                                t.end()
                                return
                            })
                        }

                        return res.json()
                    })
                    .then(res => {
                        if (!res) return
                        t.equal(res.value.content.type, 'follow',
                            "should return 'follow' message")
                        t.equal(res.value.content.contact, _alice.did,
                            'should follow the right person')
                        t.end()
                    })
            })
    })


    test('redeem the same invitation code more than once', t => {
        // TODO
        ssc.createKeys()
            .then(alice => {
                return ssc.createMsg(alice.keys, null, {
                    type: 'redeem-invitation',
                    code: _code
                })
            })
            .then(msg => {
                return fetch(BASE + '/.netlify/functions/redeem-invitation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(msg)
                })
            })
            .then(res => {
                if (res.ok) {
                    t.fail('should not have an ok response')
                    t.end()
                    return
                }

                t.equal(res.status, 404, 'should return 404 code')
                return res.text()
            })
            .then(text => {
                if (!text) return
                t.ok(text.includes('NotFound'),
                    'should return a not found message')
                t.end()
            })
    })


    test('redeem an invitation with a bad code', t => {
        ssc.createKeys()
            .then(alice => {
                return ssc.createMsg(alice.keys, null, {
                    type: 'redeem-invitation',
                    code: 'abc'
                })
            })
            .then(msg => {
                return fetch(BASE + '/.netlify/functions/redeem-invitation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(msg)
                })
            })
            .then(res => {
                if (res.ok) {
                    t.fail('should not be an ok response')
                    t.end()
                    return
                }

                t.equal(res.status, 404,
                    'should return a 404 code because the invitation code ' +
                        'does not exist'
                )
                return res.text()
            })
            .then(text => {
                if (!text) return
                t.ok(text.includes('NotFound'),
                    'should return the right message')
                t.end()
            })
    })
}
