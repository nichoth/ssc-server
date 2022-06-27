require('dotenv').config()
const setup = require('./setup')
const test = require('tape')
const onExit = require('signal-exit')

if (require.main === module) {
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
        ntl.kill()
        t.end()
    })
}

function feedTests (test, keys) {
    // keys here is admin
    test('first save a profile for the new user', t => {

    })
}
