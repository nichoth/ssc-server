require('dotenv').config()
var test = require('tape')

var ntl
test('setup', t => {
    require('../setup')(t.test, (netlify) => {
        ntl = netlify
        t.end()
    })
})

test('post tests', t => {
    t.end()
    require('./post')(t.test)
})

test('all done', function (t) {
    ntl.kill()
    t.end()
})
