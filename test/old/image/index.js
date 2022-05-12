require('dotenv').config()
var test = require('tape')

// var ntl
// test('setup', t => {
//     require('../setup')(t.test, (netlify) => {
//         ntl = netlify
//         t.end()
//     })
// })

test('image tests', t => {
    require('./image')(t.test)
    t.end()
})

// test('all done', function (t) {
//     ntl.kill()
//     t.end()
// })

