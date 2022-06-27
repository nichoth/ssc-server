require('dotenv').config()
const test = require('tape')
const onExit = require('signal-exit')
const ssc = require('@nichoth/ssc-lambda')
const u = require('./util')
const { setup, allDone } = require('./setup')

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

    test('feed', t => {
        feedTests(t.test, _keys, _did)
        t.end()
    })

    test('all done', function (t) {
        allDone(ntl)
        t.end()
    })
}

function feedTests (test, keys) {
    // keys here is admin
    test('first create a user with a profile', t => {
        ssc.createKeys()
            .then(user => {
                return u.inviteAndFollow({
                    adminKeys: keys,
                    user,
                    userProfile: { username: 'flob' }
                })
            })
            .then(res => {
                console.log('a new person has joined', res)
                t.end()
            })
    })
}
