require('dotenv').config()
var test = require('tape')
// var { spawn } = require('child_process')
var followTests = require('./follow')
var ssc = require('@nichoth/ssc')

var keys = ssc.createKeys()
var userOneKeys = ssc.createKeys()
var userTwoKeys = ssc.createKeys()

var ntl
test('setup', t => {
    require('../setup')(t.test, netlify => {
        ntl = netlify
    })
    t.end()
})

test('follow tests', t => {
    followTests(t.test, { keys, userOneKeys, userTwoKeys })
    t.end()
})

test('all done', function (t) {
    ntl.kill()
    t.end()
})
