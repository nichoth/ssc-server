require('dotenv').config()
require('isomorphic-fetch')
var test = require('tape')
// var { spawn } = require('child_process')
var ssc = require('@nichoth/ssc')
var fs = require('fs')
// var createHash = require('crypto').createHash
// var Client = require('../src/client')
// var client = Client()
// var base = 'http://localhost:8888'

// var { follow, getPostsWithFoafs, post } = Client()

var ntl
var keys = ssc.createKeys()
var userOneKeys = ssc.createKeys()
var userTwoKeys = ssc.createKeys()

// get the test file & its hash ready
// var caracal = fs.readFileSync(__dirname + '/caracal.jpg')
// let base64Caracal = 'data:image/png;base64,' + caracal.toString('base64')
// var hash = createHash('sha256')
// hash.update(base64Caracal)
// var fileHash = hash.digest('base64')

var ntl
test('setup', function (t) {
    require('./setup')(t.test, (netlify) => {
        ntl = netlify
    })
    t.end()
})

test('following', t => {
    require('./follow/follow')(t.test, { keys, userOneKeys, userTwoKeys})
})

test('posts', t => {
    require('./post/post')(t.test)
})

test('foafs', t => {
    var keys = ssc.createKeys()
    var userOneKeys = ssc.createKeys()
    var userTwoKeys = ssc.createKeys()
    var ks = { keys, userOneKeys, userTwoKeys }
    require('./foafs/foafs')(t.test, ks)
})

test('images', t =>{
    require('./image/image')(t.test)
})

test('get relevant posts', function (t) {
    console.log('todo')
    t.end()
})

test('all done', function (t) {
    ntl.kill()
    t.end()
})
