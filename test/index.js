import { createRequire } from 'module';
const require = createRequire(import.meta.url)
require('dotenv').config()
require('isomorphic-fetch')
const base = 'http://localhost:8888'
const test = require('tape')
// import { test } from 'tape'
// var { spawn } = require('child_process')
// const ssc = require('@nichoth/ssc')
// const ssc = require('@nichoth/ssc')
import ssc from '@nichoth/ssc'
import setup from './setup.js'
// var fs = require('fs')
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
    setup(t.test, (netlify) => {
        ntl = netlify

        process.on('exit', () => {
            ntl.kill('SIGINT');
        })

        t.end()
    })
})

test('pin a message', t => {
    fetch(base + '/.netlify/functions/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ssc.createMsg(keys, null, {
            type: 'pin',
            test: 'wooo'
        }))
    })
        .then(res => {
            if (!res.ok) {
                res.text().then(text => {
                    t.fail(text)
                    t.end()
                })
            }

            return res.json()
        })
        .then(res => {
            console.log('got a response', res)
        })
        .catch(err => {
            t.fail(err.toString())
            t.end()
        })
})

// test('following', t => {
//     require('./follow/follow')(t.test, { keys, userOneKeys, userTwoKeys})
// })

// test('posts', t => {
//     require('./post/post')(t.test)
// })

// test('foafs', t => {
//     var keys = ssc.createKeys()
//     var userOneKeys = ssc.createKeys()
//     var userTwoKeys = ssc.createKeys()
//     var ks = { keys, userOneKeys, userTwoKeys }
//     require('./foafs/foafs')(t.test, ks)
// })

// test('invitations', t => {
//     require('./invitation/invitation')(t.test)
// })

// test('images', t =>{
//     require('./image/image')(t.test)
// })

// test('get relevant posts', function (t) {
//     console.log('todo')
//     t.end()
// })

// test('all done', function (t) {
//     ntl.kill()
//     t.end()
// })
