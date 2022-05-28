require('dotenv').config()
require('isomorphic-fetch')
// const path = require('path')
const ssc = require('@nichoth/ssc-lambda')
const test = require('tape')
// const fs = require('fs')
const onExit = require('signal-exit')
// const { admins } = require('../src/config.json')
const base = 'http://localhost:8888'
const setup = require('./setup')


// @TODO -- need to start the dev server before running tests
if (require.main === module) {
    var _keys
    var ntl

    test('setup', function (t) {
        setup(t.test, ({ netlify, keys }) => {
            ntl = netlify
            _keys = keys

            onExit(() => {
                ntl.kill('SIGINT')
            })

            t.end()

            // ssc.createKeys().then(user => {
            //     keys = user.keys
            //     ssc.exportKeys(user.keys).then(exported => {
            //         // need to write this did to config.admins
            //         const did = ssc.publicKeyToDid(exported.public)
            //         const configPath = path.resolve(__dirname, '..', 'src',
            //             'config.json')
            //         admins.push({ did })

            //         fs.writeFileSync(configPath, JSON.stringify(
            //             Object.assign({}, config, { admins }), null, 2))


            //         t.end()
            //     })
            // })
        })
    })

    test('pin', t => {
        pin(t.test, _keys)
        t.end()
    })

    test('all done', function (t) {
        ntl.kill()
        t.end()
    })
}

module.exports = pin

function pin (test, keys) {
    test('pin a message', t => {
        ssc.createMsg(keys, null, {
            type: 'pin',
            text: 'wooo'
        })
            .then(msg => {
                fetch(base + '/.netlify/functions/pin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(msg)
                })
                    .then(res => {
                        if (!res.ok) {
                            return res.text().then(text => {
                                console.log('errrrrrrrrr', text)
                                t.fail(text)
                                t.end()
                            })
                        }

                        return res.json()
                    })
                    .then(res => {
                        const key = ssc.getId(msg)
                        t.equal(res.data.key, key,
                            'should return the expected key')
                        t.equal(res.data.value.content.text, 'wooo',
                            'should return the pinned message')
                        t.end()
                    })
                    .catch(err => {
                        t.fail(err.toString())
                        t.end()
                    })
            })
    })

    test('try to pin something with an invalid DID', t => {
        // we don't add this DID to the `admins` array in config.json,
        // so it is not allowed
        ssc.createKeys().then(alice => {
            return ssc.createMsg(alice.keys, null, {
                type: 'pin',
                text: 'test two'
            })
        })
            .then(msg => {
                return fetch(base + '/.netlify/functions/pin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(msg)
                })
            })
            .then(res => {
                if (res.ok) {
                    t.fail('should not have ok response')
                    return t.end()
                }

                res.text().then(text => {
                    t.equal(res.status, 403, 'should have expected status code')
                    t.equal(text, 'not allowed', 'should have expected error body')
                    t.end()
                })
            })
            .catch(err => {
                t.fail(err.toString())
                t.end()
            })
    })

    test('try to pin something with an invalid signature', t => {
        ssc.createMsg(keys, null, {
            type: 'pin',
            text: 'wooo'
        })
            .then(msg => {
                msg.signature = '123'

                fetch(base + '/.netlify/functions/pin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(msg)
                })
                    .then(res => {
                        if (res.ok) {
                            t.fail('should return an error code')
                            t.end()
                            return
                        }

                        t.equal(res.status, 400, 'should return a 400 code')
                        res.text().then(text => {
                            t.equal(text, 'invalid message')
                            t.end()
                        })
                    })
            })
    })



    test('get pinned messages', t => {
        fetch(base + '/.netlify/functions/pin')
            .then(res => {
                if (!res.ok) {
                    res.text()
                        .then(text => {
                            console.log('**errrr**', text)
                            throw new Error(text)
                        })
                }

                return res.json()
            })
            .then(json => {
                t.equal(json.value.content.text, 'wooo',
                    'should return the expected message')
                t.equal(json.value.content.type, 'pin',
                    'should return the expected type')
                t.end()
            })
            .catch(err => {
                console.log('*errrrrrr in catch*', err)
                t.fail(err)
                t.end()
            })
    })

}
