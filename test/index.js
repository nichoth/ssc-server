// import { createRequire } from 'module';
// const require = createRequire(import.meta.url)

// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
// const __dirname = dirname(fileURLToPath(import.meta.url));

// import path from 'path'
const path = require('path')

require('dotenv').config()
require('isomorphic-fetch')
const base = 'http://localhost:8888'
const test = require('tape')
var onExit = require('signal-exit')
const fs = require('fs')
const ssc = require('@nichoth/ssc-lambda')
const setup = require('./setup')

const { admins } = require('../src/config.json')
// var fs = require('fs')
// var createHash = require('crypto').createHash
// var Client = require('../src/client')
// var client = Client()
// var base = 'http://localhost:8888'

// var { follow, getPostsWithFoafs, post } = Client()

var ntl
var keys
// var userOneKeys = ssc.createKeys()
// var userTwoKeys = ssc.createKeys()

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

        onExit(() => {
            ntl.kill('SIGINT')
        })

        ssc.createKeys().then(_keys => {
            keys = _keys.keys
            ssc.exportKeys(keys).then(exported => {
                // need to write this did to config.admins
                const did = ssc.publicKeyToDid(exported.public)
                console.log('*did*', did)
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


test('pin a message', t => {
    ssc.createMsg(keys, null, {
        type: 'pin',
        text: 'wooo'
    })
        .then(msg => {
            fetch(base + '/.netlify/functions/pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            })
                .then(res => {
                    if (!res.ok) {
                        return res.text().then(text => {
                            console.log('errrrrrrrrr', text)
                            t.fail(text)
                            t.end()
                        })
                    }

                    return res.json()
                })
                .then(res => {
                    const key = ssc.getId(msg)
                    t.equal(res.data.key, key,
                        'should return the exprected key')
                    t.equal(res.data.value.content.text, 'wooo',
                        'should return the pinned message')
                    t.end()
                })
                .catch(err => {
                    t.fail(err.toString())
                    t.end()
                })
        })
})

test('get pinned messages', t => {
    fetch(base + '/.netlify/functions/pin')
        .then(res => {
            if (!res.ok) {
                res.text()
                    .then(text => {
                        console.log('**errrr**', text)
                        throw new Error(text)
                    })
            }

            return res.json()
        })
        .then(json => {
            t.equal(json[0].value.content.text, 'wooo',
                'should return the expected message')
            t.equal(json[0].value.content.type, 'pin',
                'should return the expected type')
            t.end()
        })
        .catch(err => {
            console.log('*errrrrrr in catch*', err)
            t.fail(err)
            t.end()
        })
})

test('all done', function (t) {
    ntl.kill()
    t.end()
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
