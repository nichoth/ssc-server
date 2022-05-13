const path = require('path')

require('dotenv').config()
require('isomorphic-fetch')
const base = 'http://localhost:8888'
const test = require('tape')
var onExit = require('signal-exit')
const fs = require('fs')
const ssc = require('@nichoth/ssc-lambda')
const setup = require('./setup')

const { admins } = require('../src/config.json')

var ntl
var keys

var ntl
test('setup', function (t) {
    setup(t.test, (netlify) => {
        ntl = netlify

        onExit(() => {
            ntl.kill('SIGINT')
        })

        ssc.createKeys().then(_keys => {
            keys = _keys.keys
            ssc.exportKeys(keys).then(exported => {
                // need to write this did to config.admins
                const did = ssc.publicKeyToDid(exported.public)
                const configPath = path.resolve(__dirname, '..', 'src',
                    'config.json')
                admins.push({ did })

                fs.writeFileSync(configPath, JSON.stringify({
                    admins
                }, null, 2))

                t.end()
            })
        })
    })
})


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
                        'should return the exprected key')
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
            t.equal(json[0].value.content.text, 'wooo',
                'should return the expected message')
            t.equal(json[0].value.content.type, 'pin',
                'should return the expected type')
            t.end()
        })
        .catch(err => {
            console.log('*errrrrrr in catch*', err)
            t.fail(err)
            t.end()
        })
})

test('all done', function (t) {
    ntl.kill()
    t.end()
})
