const path = require('path')

require('dotenv').config()
require('isomorphic-fetch')
// const base = 'http://localhost:8888'
const test = require('tape')
const onExit = require('signal-exit')
const fs = require('fs')
const ssc = require('@nichoth/ssc-lambda')
const setup = require('./setup')

const { admins } = require('../src/config.json')

var ntl
var keys
var did

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
                const _did = ssc.publicKeyToDid(exported.public)
                did = _did
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

test('alternate', t => {
    require('./alternate')(t.test, keys, did)
})

test('pin', t => {
    require('./pin')(t.test, keys)
})

test('all done', function (t) {
    ntl.kill()
    t.end()
})
