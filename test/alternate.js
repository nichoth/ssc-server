require('dotenv').config()
require('isomorphic-fetch')
const path = require('path')
const ssc = require('@nichoth/ssc-lambda')
const test = require('tape')
const fs = require('fs')
const onExit = require('signal-exit')
const setup = require('./setup')
const { admins } = require('../src/config.json')
const base = 'http://localhost:8888'

if (require.main === module) {
    var keys
    var ntl
    var did

    test('setup', function (t) {
        setup(t.test, (netlify) => {
            ntl = netlify

            onExit(() => {
                ntl.kill('SIGINT')
            })

            ssc.createKeys().then(user => {
                keys = user.keys
                ssc.exportKeys(user.keys).then(exported => {
                    // need to write this did to config.admins
                    const _did = ssc.publicKeyToDid(exported.public)
                    did = _did
                    console.log('*did*', _did)
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

    test('alternates', t => {
        alt(t.test, keys, did)
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
            fetch(base + '/.netlify/functions/alternate', {
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
                t.equal(res.value.content.type, 'alternate',
                    'should return the right message type')
                t.end()
            })
        })
    })
}
