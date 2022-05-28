require('dotenv').config()
require('isomorphic-fetch')
const test = require('tape')
const onExit = require('signal-exit')
const setup = require('./setup')

var ntl
var _keys
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

test('alternate', t => {
    require('./alternate')(t.test, _keys, _did)
})

test('pin', t => {
    require('./pin')(t.test, _keys)
})

test('all done', function (t) {
    ntl.kill()
    t.end()
})
