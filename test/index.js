require('dotenv').config()
require('isomorphic-fetch')
const test = require('tape')
const onExit = require('signal-exit')
const { setup, allDone } = require('./setup')

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

test('follow', t => {
    require('./follow')(t.test, _keys, _did)
})

test('invite', t => {
    require('./invite')(t.test, _keys, _did)
})

test('pin', t => {
    require('./pin')(t.test, _keys, _did)
})

test('post', t => {
    require('./post')(t.test, _keys, _did)
})

test('profile', t => {
    require('./profile')(t.test, _keys, _did)
})

test('relevant posts', t => {
    require('./relevant-posts')(t.test, _keys, _did)
})

test('replies', t => {
    require('./reply')(t.test, _keys, _did)
})

test('all done', function (t) {
    allDone(ntl)
    t.end()
})
